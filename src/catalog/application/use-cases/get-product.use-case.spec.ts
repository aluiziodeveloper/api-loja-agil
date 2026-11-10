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

  it('should return the product, active or not', async () => {
    const product = aProduct().withName('Caneca Ágil').inactive().build();
    await products.save(product);

    const output = await getProduct.execute({
      productId: product.id.toString(),
    });

    expect(output).toEqual(product.toSnapshot());
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
