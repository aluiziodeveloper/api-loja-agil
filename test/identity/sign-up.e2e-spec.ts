import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { PrismaDatabase } from '../../src/shared/infrastructure/database/prisma-database.js';
import { resetDatabase } from '../../src/shared/infrastructure/database/__tests__/reset-database.js';
import { createTestApp } from '../setup/create-test-app.js';

describe('POST /users (e2e)', () => {
  let app: NestFastifyApplication;
  let database: PrismaDatabase;

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get(PrismaDatabase);
  });

  beforeEach(async () => {
    await resetDatabase(database);
  });

  afterAll(async () => {
    await app.close();
  });

  const signUp = (payload: object) =>
    app.inject({ method: 'POST', url: '/users', payload });

  it('should register a customer and answer 201 without the password', async () => {
    const response = await signUp({
      name: 'Ana Souza',
      email: 'ana@loja.dev',
      password: 'caneca123',
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      id: expect.any(String),
      name: 'Ana Souza',
      email: 'ana@loja.dev',
      role: 'CUSTOMER',
    });
  });

  it('should store a scrypt hash, never the password', async () => {
    await signUp({
      name: 'Ana Souza',
      email: 'ana@loja.dev',
      password: 'caneca123',
    });

    const user = await database
      .client()
      .user.findUniqueOrThrow({ where: { email: 'ana@loja.dev' } });
    expect(user.passwordHash).toMatch(/^scrypt\$/);
    expect(user.passwordHash).not.toContain('caneca123');
  });
});
