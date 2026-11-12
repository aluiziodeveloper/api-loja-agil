import {
  type SearchOptions,
  SearchParams,
  type SearchParamsInput,
} from '../../shared/application/search/search-params.js';

export type ProductSortField = 'name' | 'price' | 'sku';

export type ProductSearchParams = SearchParams<ProductSortField>;

export type ProductSearchCriteria = {
  params: ProductSearchParams;
  activeOnly: boolean;
};

/** Também o que o documento da API publica para o `sort`. */
export const productSearchOptions: SearchOptions<ProductSortField> = {
  sortableFields: ['name', 'price', 'sku'],
  defaultSort: 'name',
};

export function productSearchParams(
  input: SearchParamsInput,
): ProductSearchParams {
  return SearchParams.create(input, productSearchOptions);
}
