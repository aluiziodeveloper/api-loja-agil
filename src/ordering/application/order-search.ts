import {
  SearchParams,
  type SearchParamsInput,
} from '../../shared/application/search/search-params.js';

export type OrderSearchParams = SearchParams<'createdAt'>;

/** Os pedidos do cliente, os mais recentes primeiro por padrão. */
export function orderSearchParams(
  input: Omit<SearchParamsInput, 'sort' | 'filter'>,
): OrderSearchParams {
  return SearchParams.create(
    { ...input, sortDirection: input.sortDirection ?? 'desc' },
    { sortableFields: ['createdAt'], defaultSort: 'createdAt' },
  );
}
