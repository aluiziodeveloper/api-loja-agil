import type { SearchParamsInput } from '../../../shared/application/search/search-params.js';
import { Sku } from '../../../shared/domain/sku.value-object.js';
import { aProduct } from '../../domain/__tests__/product.builder.js';
import { ProductName } from '../../domain/product-name.value-object.js';
import type { Product } from '../../domain/product.entity.js';
import type { ProductRepository } from '../ports/product.repository.js';
import { productSearchParams } from '../product-search.js';

/** Ids fixos, salvos fora de ordem: só o desempate por id põe a Almofada antes. */
const LOWER_ID = '019a6b7e-0000-7000-8000-000000000001';
const HIGHER_ID = '019a6b7e-0000-7000-8000-000000000002';

function names(products: Product[]): string[] {
  return products.map((product) => product.toSnapshot().name);
}

function skus(products: Product[]): string[] {
  return products.map((product) => product.toSnapshot().sku);
}

/**
 * O comportamento que toda implementação de `ProductRepository` precisa ter. O
 * fake e o repositório do banco rodam estes mesmos testes.
 */
export function productRepositoryContract(
  createRepository: () => Promise<ProductRepository>,
): void {
  let products: ProductRepository;

  beforeEach(async () => {
    products = await createRepository();
  });

  it('should find a saved product by id, as a new instance', async () => {
    const product = aProduct().build();
    await products.save(product);

    const found = await products.findById(product.id);

    expect(found).not.toBe(product);
    expect(found?.toSnapshot()).toEqual(product.toSnapshot());
  });

  it('should find a saved product by SKU', async () => {
    const product = aProduct().withSku('CAM123-AZUL').build();
    await products.save(product);

    const found = await products.findBySku(Sku.create('cam123-azul'));

    expect(found?.toSnapshot()).toEqual(product.toSnapshot());
  });

  it('should return null when nothing matches', async () => {
    const product = aProduct().build();

    expect(await products.findById(product.id)).toBeNull();
    expect(await products.findBySku(Sku.create('NADA01'))).toBeNull();
  });

  it('should only keep changes after they are saved', async () => {
    const product = aProduct().withName('Caneca').build();
    await products.save(product);

    product.rename(ProductName.create('Caneca Ágil'));
    const beforeSave = await products.findById(product.id);
    await products.save(product);
    const afterSave = await products.findById(product.id);

    expect(beforeSave?.toSnapshot().name).toBe('Caneca');
    expect(afterSave?.toSnapshot().name).toBe('Caneca Ágil');
  });

  describe('search', () => {
    function search(input: SearchParamsInput, activeOnly = false) {
      return products.search({
        params: productSearchParams(input),
        activeOnly,
      });
    }

    beforeEach(async () => {
      const catalog = [
        aProduct()
          .withSku('CAM001-AZ')
          .withName('Camiseta Azul')
          .withPriceInCents(4990),
        aProduct()
          .withId(HIGHER_ID)
          .withSku('CAN001')
          .withName('Caneca Ágil')
          .withPriceInCents(3500),
        aProduct().withSku('ADE001').withName('Adesivo').withPriceInCents(500),
        aProduct()
          .withSku('BON001')
          .withName('Boné Azul')
          .withPriceInCents(5990),
        aProduct()
          .withId(LOWER_ID)
          .withSku('ALM001')
          .withName('Almofada')
          .withPriceInCents(3500)
          .inactive(),
      ];
      for (const builder of catalog) {
        await products.save(builder.build());
      }
    });

    it('should sort by name in Portuguese by default, including inactive products', async () => {
      const result = await search({});

      expect(names(result.toOutput().items)).toEqual([
        'Adesivo',
        'Almofada',
        'Boné Azul',
        'Camiseta Azul',
        'Caneca Ágil',
      ]);
      expect(result.toOutput().total).toBe(5);
    });

    it('should place accented names where a Portuguese reader expects', async () => {
      await products.save(aProduct().withName('Álbum').build());

      const result = await search({});

      expect(names(result.toOutput().items).slice(0, 3)).toEqual([
        'Adesivo',
        'Álbum',
        'Almofada',
      ]);
    });

    it('should filter by name or SKU, ignoring case', async () => {
      const byName = await search({ filter: 'AZUL' });
      const bySku = await search({ filter: 'can0' });

      expect(names(byName.toOutput().items)).toEqual([
        'Boné Azul',
        'Camiseta Azul',
      ]);
      expect(names(bySku.toOutput().items)).toEqual(['Caneca Ágil']);
    });

    it('should not ignore accents when filtering', async () => {
      const withAccent = await search({ filter: 'ágil' });
      const withoutAccent = await search({ filter: 'agil' });

      expect(names(withAccent.toOutput().items)).toEqual(['Caneca Ágil']);
      expect(withoutAccent.toOutput().items).toEqual([]);
    });

    it('should sort by price, breaking ties by id', async () => {
      const result = await search({ sort: 'price', sortDirection: 'desc' });

      const prices = result
        .toOutput()
        .items.map((item) => item.toSnapshot().priceInCents);
      expect(prices).toEqual([5990, 4990, 3500, 3500, 500]);
      expect(names(result.toOutput().items.slice(2, 4))).toEqual([
        'Almofada',
        'Caneca Ágil',
      ]);
    });

    it('should sort SKUs character by character', async () => {
      await products.save(aProduct().withSku('CAM0012').build());

      const result = await search({ sort: 'sku' });

      expect(skus(result.toOutput().items)).toEqual([
        'ADE001',
        'ALM001',
        'BON001',
        'CAM001-AZ',
        'CAM0012',
        'CAN001',
      ]);
    });

    it('should return the requested page and the total before paging', async () => {
      const result = await search({ page: 2, perPage: 2 });

      expect(names(result.toOutput().items)).toEqual([
        'Boné Azul',
        'Camiseta Azul',
      ]);
      expect(result.toOutput()).toMatchObject({
        total: 5,
        page: 2,
        lastPage: 3,
      });
    });

    it('should leave inactive products out when asked', async () => {
      const result = await search({}, true);

      expect(names(result.toOutput().items)).not.toContain('Almofada');
      expect(result.toOutput().total).toBe(4);
    });

    it('should return an empty page beyond the last one', async () => {
      const result = await search({ page: 9 });

      expect(result.toOutput()).toMatchObject({
        items: [],
        total: 5,
        lastPage: 1,
      });
    });
  });
}
