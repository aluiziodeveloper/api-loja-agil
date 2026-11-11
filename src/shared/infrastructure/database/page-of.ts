import type { SearchParams } from '../../application/search/search-params.js';

/**
 * Os argumentos de uma página para o `findMany`: a ordenação vem de quem chama
 * (com o desempate, D17), o deslocamento e o tamanho vêm dos parâmetros.
 */
export function pageOf<OrderBy>(
  params: SearchParams<string>,
  orderBy: OrderBy[],
): { orderBy: OrderBy[]; skip: number; take: number } {
  return { orderBy, skip: params.offset(), take: params.perPage() };
}
