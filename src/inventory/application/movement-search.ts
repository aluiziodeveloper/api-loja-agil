import {
  SearchParams,
  type SearchParamsInput,
} from '../../shared/application/search/search-params.js';

export type MovementSearchParams = SearchParams<'occurredAt'>;

/** Histórico em ordem cronológica por padrão; `sortDirection: 'desc'` inverte. */
export function movementSearchParams(
  input: Omit<SearchParamsInput, 'sort' | 'filter'>,
): MovementSearchParams {
  return SearchParams.create(input, {
    sortableFields: ['occurredAt'],
    defaultSort: 'occurredAt',
  });
}
