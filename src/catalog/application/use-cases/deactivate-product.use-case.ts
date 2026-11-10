import type { UseCase } from '../../../shared/application/use-case.js';
import { loadProduct } from '../load-product.js';
import type { ProductRepository } from '../ports/product.repository.js';
import { toProductOutput, type ProductOutput } from '../product-output.js';

export type DeactivateProductInput = {
  productId: string;
};

export class DeactivateProductUseCase implements UseCase<
  DeactivateProductInput,
  ProductOutput
> {
  constructor(private readonly products: ProductRepository) {}

  async execute(input: DeactivateProductInput): Promise<ProductOutput> {
    const product = await loadProduct(this.products, input.productId);
    product.deactivate();
    await this.products.save(product);
    return toProductOutput(product);
  }
}
