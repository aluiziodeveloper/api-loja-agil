import type { UseCase } from '../../../shared/application/use-case.js';
import { ProductNotFoundError } from '../errors/product-not-found.error.js';
import { loadProduct } from '../load-product.js';
import type { ProductRepository } from '../ports/product.repository.js';
import { toProductOutput, type ProductOutput } from '../product-output.js';

export type GetProductInput = {
  productId: string;
  /** Por padrão, um produto inativo é tratado como se não existisse. */
  activeOnly?: boolean;
};

export class GetProductUseCase implements UseCase<
  GetProductInput,
  ProductOutput
> {
  constructor(private readonly products: ProductRepository) {}

  async execute({
    productId,
    activeOnly = true,
  }: GetProductInput): Promise<ProductOutput> {
    const product = await loadProduct(this.products, productId);
    if (activeOnly && !product.isActive()) {
      throw new ProductNotFoundError();
    }
    return toProductOutput(product);
  }
}
