import {
  SearchParams,
  type SearchParamsInput,
} from '../../shared/application/search/search-params.js';

export type ProductSortField = 'name' | 'price' | 'sku';

export type ProductSearchParams = SearchParams<ProductSortField>;

export type ProductSearchCriteria = {
  params: ProductSearchParams;
  activeOnly: boolean;
};

export function productSearchParams(
  input: SearchParamsInput,
): ProductSearchParams {
  return SearchParams.create(input, {
    sortableFields: ['name', 'price', 'sku'],
    defaultSort: 'name',
  });
}
