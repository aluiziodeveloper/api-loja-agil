import { defineConfig } from 'prisma/config';

/**
 * `prisma generate` não precisa de banco: lendo a variável direto, os jobs do
 * CI sem Postgres (lint, build) geram o client. Migrations exigem a URL.
 */
export default defineConfig({
  schema: 'prisma/schema',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env.DATABASE_URL },
});
