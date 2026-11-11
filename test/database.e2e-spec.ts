import { PrismaDatabase } from '../src/shared/infrastructure/database/prisma-database.js';
import { useTestApp } from './setup/e2e.js';

describe('DatabaseModule (e2e)', () => {
  const e2e = useTestApp();

  it('should connect the application to the test database', async () => {
    const database = e2e.app.get(PrismaDatabase);

    const [{ name }] = await database.client().$queryRaw<{ name: string }[]>`
      SELECT current_database() AS name`;

    expect(name).toBe('loja_agil_test');
  });
});
