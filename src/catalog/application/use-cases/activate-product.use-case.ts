import type { UseCase } from '../../../shared/application/use-case.js';
import { loadProduct } from '../load-product.js';
import type { ProductRepository } from '../ports/product.repository.js';
import { toProductOutput, type ProductOutput } from '../product-output.js';

export type ActivateProductInput = {
  productId: string;
};

export class ActivateProductUseCase implements UseCase<
  ActivateProductInput,
  ProductOutput
> {
  constructor(private readonly products: ProductRepository) {}

  async execute(input: ActivateProductInput): Promise<ProductOutput> {
    const product = await loadProduct(this.products, input.productId);
    product.activate();
    await this.products.save(product);
    return toProductOutput(product);
  }
}
