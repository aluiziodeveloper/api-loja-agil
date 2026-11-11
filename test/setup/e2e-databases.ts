/**
 * Os e2e rodam em paralelo, e cada worker do Vitest tem o seu banco:
 * `loja_agil_test_e2e_1`, `_2`... Um teste nunca apaga os dados de outro,
 * e o banco dos testes de integração fica de fora.
 */
export const E2E_WORKERS = 4;

export function e2eDatabaseUrl(worker: number | string): string {
  const url = new URL(process.env.DATABASE_URL_TEST ?? '');
  if (!url.pathname.slice(1)) {
    throw new Error('DATABASE_URL_TEST is not set');
  }
  url.pathname = `${url.pathname}_e2e_${worker}`;
  return url.toString();
}
