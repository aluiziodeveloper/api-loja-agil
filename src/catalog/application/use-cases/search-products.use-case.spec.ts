import { aProduct } from '../../domain/__tests__/product.builder.js';
import { InMemoryProductRepository } from '../__tests__/in-memory-product.repository.js';
import { SearchProductsUseCase } from './search-products.use-case.js';

describe('SearchProductsUseCase', () => {
  let products: InMemoryProductRepository;
  let searchProducts: SearchProductsUseCase;

  beforeEach(async () => {
    products = new InMemoryProductRepository();
    searchProducts = new SearchProductsUseCase(products);
    await products.save(
      aProduct()
        .withSku('CAN001')
        .withName('Caneca Ágil')
        .withPriceInCents(3500)
        .build(),
    );
    await products.save(
      aProduct()
        .withSku('ALM001')
        .withName('Almofada')
        .withPriceInCents(3500)
        .inactive()
        .build(),
    );
  });

  it('should return only active products by default, as outputs', async () => {
    const output = await searchProducts.execute({});

    expect(output).toEqual({
      items: [
        {
          id: expect.any(String),
          sku: 'CAN001',
          name: 'Caneca Ágil',
          priceInCents: 3500,
          active: true,
        },
      ],
      total: 1,
      page: 1,
      perPage: 15,
      lastPage: 1,
    });
  });

  it('should include inactive products when asked', async () => {
    const output = await searchProducts.execute({ activeOnly: false });

    expect(output.items.map((item) => item.name)).toEqual([
      'Almofada',
      'Caneca Ágil',
    ]);
    expect(output.total).toBe(2);
  });

  it('should pass filter, sorting and paging to the repository', async () => {
    const output = await searchProducts.execute({
      activeOnly: false,
      filter: 'a',
      sort: 'sku',
      sortDirection: 'desc',
      perPage: 1,
    });

    expect(output.items.map((item) => item.sku)).toEqual(['CAN001']);
    expect(output).toMatchObject({ total: 2, perPage: 1, lastPage: 2 });
  });

  it('should reject invalid search params', async () => {
    await expect(searchProducts.execute({ sort: 'password' })).rejects.toThrow(
      expect.objectContaining({ code: 'INVALID_SEARCH_PARAMS' }),
    );
  });
});
