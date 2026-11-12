import { resetDatabase } from './__tests__/reset-database.js';
import { PrismaDatabase } from './prisma-database.js';

const FAILURE = new Error('falhou no meio');

describe('PrismaDatabase', () => {
  const database = new PrismaDatabase(process.env.DATABASE_URL ?? '');

  beforeEach(async () => {
    await resetDatabase(database);
  });

  afterAll(async () => {
    await database.disconnect();
  });

  /** Grava uma linha qualquer: a tabela não importa, só a transação. */
  async function insertProduct(sku: string): Promise<void> {
    await database.client().product.create({
      data: {
        id: crypto.randomUUID(),
        sku,
        name: sku,
        priceInCents: 100,
        active: true,
      },
    });
  }

  async function storedSkus(): Promise<string[]> {
    const rows = await database
      .client()
      .product.findMany({ orderBy: { sku: 'asc' } });
    return rows.map((row) => row.sku);
  }

  it('should answer a ping while the database is up', async () => {
    await expect(database.ping()).resolves.toBeUndefined();
  });

  it('should fail the ping when the database cannot be reached', async () => {
    const unreachable = new PrismaDatabase(
      'postgresql://postgres:docker@127.0.0.1:1/ninguem',
    );

    await expect(unreachable.ping()).rejects.toThrow();
    await unreachable.disconnect();
  });

  it('should talk to the test database', async () => {
    const [row] = await database.client().$queryRaw<
      { name: string }[]
    >`SELECT current_database() AS name`;

    expect(row?.name).toBe('loja_agil_test');
  });

  it('should keep what the work wrote and return its result', async () => {
    const result = await database.run(async () => {
      await insertProduct('AAA001');
      await insertProduct('BBB001');
      return 'ok';
    });

    expect(result).toBe('ok');
    expect(await storedSkus()).toEqual(['AAA001', 'BBB001']);
  });

  it('should undo everything the work wrote when it fails', async () => {
    await expect(
      database.run(async () => {
        await insertProduct('AAA001');
        await insertProduct('BBB001');
        throw FAILURE;
      }),
    ).rejects.toBe(FAILURE);

    expect(await storedSkus()).toEqual([]);
  });

  it('should join the transaction already running instead of opening another', async () => {
    await expect(
      database.run(async () => {
        await database.run(() => insertProduct('AAA001'));
        throw FAILURE;
      }),
    ).rejects.toBe(FAILURE);

    expect(await storedSkus()).toEqual([]);
  });
});
