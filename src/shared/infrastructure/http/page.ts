import type { SearchOutput } from '../../application/search/search-result.js';

export type PageMeta = Omit<SearchOutput<unknown>, 'items'>;

/** Uma página da resposta: o interceptor põe os itens em `data` e o resto em `meta`. */
export class Page<Item> {
  constructor(
    readonly items: Item[],
    readonly meta: PageMeta,
  ) {}
}

export function presentPage<Output, Response>(
  { items, ...meta }: SearchOutput<Output>,
  present: (item: Output) => Response,
): Page<Response> {
  return new Page(items.map(present), meta);
}
