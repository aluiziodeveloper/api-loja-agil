import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { PrismaDatabase } from '../src/shared/infrastructure/database/prisma-database.js';
import { createTestApp } from './setup/create-test-app.js';

describe('DatabaseModule (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should connect the application to the test database', async () => {
    const database = app.get(PrismaDatabase);

    const [{ name }] = await database.client().$queryRaw<{ name: string }[]>`
      SELECT current_database() AS name`;

    expect(name).toBe('loja_agil_test');
  });
});
