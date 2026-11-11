import type { PrismaDatabase } from '../prisma-database.js';

/** Esvazia todas as tabelas do banco de testes, menos o controle das migrations. */
export async function resetDatabase(database: PrismaDatabase): Promise<void> {
  const tables = await database.client().$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
  const names = tables.map(({ tablename }) => `"public"."${tablename}"`);
  if (names.length > 0) {
    await database
      .client()
      .$executeRawUnsafe(`TRUNCATE TABLE ${names.join(', ')} CASCADE`);
  }
}
