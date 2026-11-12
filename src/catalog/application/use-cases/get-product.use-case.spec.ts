import { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import { aProduct } from '../../domain/__tests__/product.builder.js';
import { InMemoryProductRepository } from '../__tests__/in-memory-product.repository.js';
import { ProductNotFoundError } from '../errors/product-not-found.error.js';
import { GetProductUseCase } from './get-product.use-case.js';

describe('GetProductUseCase', () => {
  let products: InMemoryProductRepository;
  let getProduct: GetProductUseCase;

  beforeEach(() => {
    products = new InMemoryProductRepository();
    getProduct = new GetProductUseCase(products);
  });

  it('should return an active product', async () => {
    const product = aProduct().withName('Caneca Ágil').build();
    await products.save(product);

    const output = await getProduct.execute({
      productId: product.id.toString(),
    });

    expect(output).toEqual(product.toSnapshot());
  });

  it('should treat an inactive product as unknown, unless asked for it', async () => {
    const product = aProduct().inactive().build();
    await products.save(product);

    const result = getProduct.execute({ productId: product.id.toString() });

    await expect(result).rejects.toThrow(ProductNotFoundError);
  });

  it('should return an inactive product when asked for it', async () => {
    const product = aProduct().inactive().build();
    await products.save(product);

    const output = await getProduct.execute({
      productId: product.id.toString(),
      activeOnly: false,
    });

    expect(output.active).toBe(false);
  });

  it('should reject an unknown product', async () => {
    const result = getProduct.execute({
      productId: UniqueId.create().toString(),
    });

    await expect(result).rejects.toThrow(ProductNotFoundError);
    await expect(result).rejects.toMatchObject({
      code: 'PRODUCT_NOT_FOUND',
      message: 'Produto não encontrado.',
    });
  });
});
