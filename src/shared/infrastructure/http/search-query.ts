import { z } from 'zod';

/**
 * Os parâmetros de busca na query string, que chegam sempre como texto: aqui
 * só a conversão. Os limites (página ≥ 1, até 100 por página, campos de
 * ordenação) são do `SearchParams`, que responde INVALID_SEARCH_PARAMS.
 */
export const searchQuery = z.object({
  page: z.coerce.number().optional(),
  perPage: z.coerce.number().optional(),
  sort: z.string().optional(),
  sortDirection: z.string().optional(),
  filter: z.string().optional(),
});
