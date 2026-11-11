import { e2eDatabaseUrl } from './e2e-databases.js';

/** Antes de cada arquivo, no worker dele: a aplicação vai subir apontando para o banco desse worker. */
process.env.DATABASE_URL = e2eDatabaseUrl(process.env.VITEST_POOL_ID ?? 1);
