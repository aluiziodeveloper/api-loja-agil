import { aProduct } from '../../domain/__tests__/product.builder.js';
import { ProductName } from '../../domain/product-name.value-object.js';
import { Sku } from '../../domain/sku.value-object.js';
import { InMemoryProductRepository } from './in-memory-product.repository.js';

describe('InMemoryProductRepository', () => {
  let products: InMemoryProductRepository;

  beforeEach(() => {
    products = new InMemoryProductRepository();
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
});
