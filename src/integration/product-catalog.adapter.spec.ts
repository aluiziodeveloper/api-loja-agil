import { aProduct } from '../catalog/domain/__tests__/product.builder.js';
import { InMemoryProductRepository } from '../catalog/application/__tests__/in-memory-product.repository.js';
import { Money } from '../shared/domain/money.value-object.js';
import { Sku } from '../shared/domain/sku.value-object.js';
import { ProductCatalogAdapter } from './product-catalog.adapter.js';

describe('ProductCatalogAdapter', () => {
  let products: InMemoryProductRepository;
  let catalog: ProductCatalogAdapter;

  beforeEach(() => {
    products = new InMemoryProductRepository();
    catalog = new ProductCatalogAdapter(products);
  });

  it('should translate a catalog product into what an order needs', async () => {
    await products.save(
      aProduct().withSku('CAN001').withPriceInCents(4990).build(),
    );

    const product = await catalog.findBySku(Sku.create('CAN001'));

    expect(product).toEqual({
      sku: Sku.create('CAN001'),
      price: Money.fromCents(4990),
      active: true,
    });
  });

  it('should tell an inactive product apart', async () => {
    await products.save(aProduct().withSku('CAN001').inactive().build());

    const product = await catalog.findBySku(Sku.create('CAN001'));

    expect(product?.active).toBe(false);
  });

  it('should answer null for an unknown SKU', async () => {
    expect(await catalog.findBySku(Sku.create('NADA01'))).toBeNull();
  });
});
