/**
 * O perfil que administra a loja (RN03). É o mesmo valor do `Role` da
 * Identidade, que o Shared Kernel não pode importar; o
 * `operator-role.spec.ts`, na borda da Identidade, confere que os dois não
 * se separam.
 */
export const OPERATOR = 'OPERATOR';
