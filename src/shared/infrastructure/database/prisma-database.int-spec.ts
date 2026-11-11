import { PrismaDatabase } from './prisma-database.js';

describe('PrismaDatabase', () => {
  const database = new PrismaDatabase(process.env.DATABASE_URL ?? '');

  afterAll(async () => {
    await database.disconnect();
  });

  it('should talk to the test database', async () => {
    const [row] = await database.client().$queryRaw<
      { name: string }[]
    >`SELECT current_database() AS name`;

    expect(row?.name).toBe('loja_agil_test');
  });
});
