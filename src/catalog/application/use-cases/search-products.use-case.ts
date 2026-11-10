import type { SearchParamsInput } from '../../../shared/application/search/search-params.js';
import type { SearchOutput } from '../../../shared/application/search/search-result.js';
import type { UseCase } from '../../../shared/application/use-case.js';
import type { ProductRepository } from '../ports/product.repository.js';
import { toProductOutput, type ProductOutput } from '../product-output.js';
import { productSearchParams } from '../product-search.js';

export type SearchProductsInput = SearchParamsInput & {
  activeOnly?: boolean;
};

export class SearchProductsUseCase implements UseCase<
  SearchProductsInput,
  SearchOutput<ProductOutput>
> {
  constructor(private readonly products: ProductRepository) {}

  async execute({
    activeOnly = true,
    ...input
  }: SearchProductsInput): Promise<SearchOutput<ProductOutput>> {
    const params = productSearchParams(input);
    const result = await this.products.search({ params, activeOnly });
    return result.map(toProductOutput).toOutput();
  }
}
