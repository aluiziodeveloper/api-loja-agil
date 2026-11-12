import { z } from 'zod';
import {
  DEFAULT_SORT_DIRECTION,
  type SearchOptions,
  SortDirection,
} from '../../application/search/search-params.js';

/**
 * Os parâmetros de busca na query string, que chegam sempre como texto: aqui
 * só a conversão. Os limites (página ≥ 1, até 100 por página, campos de
 * ordenação) são do `SearchParams`, que responde INVALID_SEARCH_PARAMS.
 * O `enum` e o `default` só documentam: quem recusa é o `SearchParams`.
 */
export const searchQuery = z.object({
  page: z.coerce.number().optional(),
  perPage: z.coerce.number().optional(),
  sort: z.string().optional(),
  sortDirection: z
    .string()
    .optional()
    .meta({
      enum: Object.values(SortDirection),
      default: DEFAULT_SORT_DIRECTION,
    }),
  filter: z.string().optional(),
});

/** O `sort` de uma busca, com os campos e o padrão que ela aceita. */
export function sortQuery<Field extends string>({
  sortableFields,
  defaultSort,
}: SearchOptions<Field>): z.ZodOptional<z.ZodString> {
  return z
    .string()
    .optional()
    .meta({ enum: [...sortableFields], default: defaultSort });
}
