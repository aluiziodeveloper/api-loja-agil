import { z } from 'zod';
import type { SearchOutput } from '../../application/search/search-result.js';

export type PageMeta = Omit<SearchOutput<unknown>, 'items'>;

/** O `meta` de uma página, para o documento OpenAPI. */
export const pageMetaResponse = z.object({
  total: z.number().int(),
  page: z.number().int(),
  perPage: z.number().int(),
  lastPage: z.number().int(),
}) satisfies z.ZodType<PageMeta>;

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
