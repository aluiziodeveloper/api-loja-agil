/**
 * "Contém", sem diferenciar maiúsculas. O `contains` do Prisma vira um
 * `ILIKE '%…%'` sem escapar nada: um `_` ou um `%` digitado pelo usuário
 * viraria curinga. Aqui eles voltam a ser texto.
 */
export function containsText(text: string) {
  return {
    contains: text.replace(/[\\%_]/g, (wildcard) => `\\${wildcard}`),
    mode: 'insensitive',
  } as const;
}
