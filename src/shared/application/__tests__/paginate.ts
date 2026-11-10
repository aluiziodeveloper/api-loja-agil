import type { SearchParams } from '../search/search-params.js';
import { SearchResult } from '../search/search-result.js';

/** Corta a página pedida de uma lista já filtrada e ordenada (para os fakes). */
export function paginate<Item>(
  items: Item[],
  params: SearchParams<string>,
): SearchResult<Item> {
  const start = params.offset();
  return SearchResult.create({
    items: items.slice(start, start + params.perPage()),
    total: items.length,
    params,
  });
}
