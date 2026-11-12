import {
  SearchParams,
  type SearchParamsInput,
} from '../../shared/application/search/search-params.js';

export type UserSortField = 'name' | 'email';

export type UserSearchParams = SearchParams<UserSortField>;

/** Em ordem alfabética do nome por padrão; o filtro procura no nome ou no e-mail. */
export function userSearchParams(input: SearchParamsInput): UserSearchParams {
  return SearchParams.create(input, {
    sortableFields: ['name', 'email'],
    defaultSort: 'name',
  });
}
