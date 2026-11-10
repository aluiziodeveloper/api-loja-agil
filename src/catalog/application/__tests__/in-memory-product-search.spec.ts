import { aProduct } from '../../domain/__tests__/product.builder.js';
import type { Product } from '../../domain/product.entity.js';
import type { SearchParamsInput } from '../../../shared/application/search/search-params.js';
import { productSearchParams } from '../product-search.js';
import { InMemoryProductRepository } from './in-memory-product.repository.js';

function names(products: Product[]): string[] {
  return products.map((product) => product.toSnapshot().name);
}

describe('InMemoryProductRepository.search', () => {
  let products: InMemoryProductRepository;

  function search(input: SearchParamsInput, activeOnly = false) {
    return products.search({ params: productSearchParams(input), activeOnly });
  }

  beforeEach(async () => {
    products = new InMemoryProductRepository();
    const catalog = [
      aProduct()
        .withSku('CAM001-AZ')
        .withName('Camiseta Azul')
        .withPriceInCents(4990),
      aProduct()
        .withSku('CAN001')
        .withName('Caneca Ágil')
        .withPriceInCents(3500),
      aProduct().withSku('ADE001').withName('Adesivo').withPriceInCents(500),
      aProduct().withSku('BON001').withName('Boné Azul').withPriceInCents(5990),
      aProduct()
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

  it('should filter by name or SKU, ignoring case', async () => {
    const byName = await search({ filter: 'AZUL' });
    const bySku = await search({ filter: 'can0' });

    expect(names(byName.toOutput().items)).toEqual([
      'Boné Azul',
      'Camiseta Azul',
    ]);
    expect(names(bySku.toOutput().items)).toEqual(['Caneca Ágil']);
  });

  it('should sort by price, breaking ties by id', async () => {
    const result = await search({ sort: 'price', sortDirection: 'desc' });

    const prices = result
      .toOutput()
      .items.map((item) => item.toSnapshot().priceInCents);
    expect(prices).toEqual([5990, 4990, 3500, 3500, 500]);
    const tied = result
      .toOutput()
      .items.slice(2, 4)
      .map((item) => item.id.toString());
    expect(tied).toEqual([...tied].sort());
  });

  it('should sort by SKU', async () => {
    const result = await search({ sort: 'sku' });

    expect(
      result.toOutput().items.map((item) => item.toSnapshot().sku),
    ).toEqual(['ADE001', 'ALM001', 'BON001', 'CAM001-AZ', 'CAN001']);
  });

  it('should return the requested page and the total before paging', async () => {
    const result = await search({ page: 2, perPage: 2 });

    expect(names(result.toOutput().items)).toEqual([
      'Boné Azul',
      'Camiseta Azul',
    ]);
    expect(result.toOutput()).toMatchObject({ total: 5, page: 2, lastPage: 3 });
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
