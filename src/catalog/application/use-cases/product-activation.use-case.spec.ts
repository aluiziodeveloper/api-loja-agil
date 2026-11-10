import { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import { aProduct } from '../../domain/__tests__/product.builder.js';
import { InMemoryProductRepository } from '../__tests__/in-memory-product.repository.js';
import { ProductNotFoundError } from '../errors/product-not-found.error.js';
import { ActivateProductUseCase } from './activate-product.use-case.js';
import { DeactivateProductUseCase } from './deactivate-product.use-case.js';

describe('Product activation', () => {
  let products: InMemoryProductRepository;

  beforeEach(() => {
    products = new InMemoryProductRepository();
  });

  async function isStoredActive(productId: string): Promise<boolean> {
    const product = await products.findById(UniqueId.from(productId));
    return product?.isActive() ?? false;
  }

  describe('DeactivateProductUseCase', () => {
    it('should deactivate and store the product', async () => {
      const product = aProduct().build();
      await products.save(product);
      const productId = product.id.toString();

      const output = await new DeactivateProductUseCase(products).execute({
        productId,
      });

      expect(output.active).toBe(false);
      expect(await isStoredActive(productId)).toBe(false);
    });

    it('should reject an unknown product', async () => {
      await expect(
        new DeactivateProductUseCase(products).execute({
          productId: UniqueId.create().toString(),
        }),
      ).rejects.toThrow(ProductNotFoundError);
    });
  });

  describe('ActivateProductUseCase', () => {
    it('should activate and store the product', async () => {
      const product = aProduct().inactive().build();
      await products.save(product);
      const productId = product.id.toString();

      const output = await new ActivateProductUseCase(products).execute({
        productId,
      });

      expect(output.active).toBe(true);
      expect(await isStoredActive(productId)).toBe(true);
    });

    it('should reject an unknown product', async () => {
      await expect(
        new ActivateProductUseCase(products).execute({
          productId: UniqueId.create().toString(),
        }),
      ).rejects.toThrow(ProductNotFoundError);
    });
  });
});
