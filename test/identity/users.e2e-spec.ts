import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { PrismaDatabase } from '../../src/shared/infrastructure/database/prisma-database.js';
import { resetDatabase } from '../../src/shared/infrastructure/database/__tests__/reset-database.js';
import { createTestApp } from '../setup/create-test-app.js';

describe('GET /users (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase(app.get(PrismaDatabase));
  });

  afterAll(async () => {
    await app.close();
  });

  async function signUp(name: string, email: string): Promise<string> {
    const response = await app.inject({
      method: 'POST',
      url: '/users',
      payload: { name, email, password: 'caneca123' },
    });
    return response.json<{ data: { id: string } }>().data.id;
  }

  it('should list the users in alphabetical order', async () => {
    await signUp('Bruno Lima', 'bruno@loja.dev');
    await signUp('Ana Souza', 'ana@loja.dev');

    const response = await app.inject({ method: 'GET', url: '/users' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: [
        expect.objectContaining({ name: 'Ana Souza' }),
        expect.objectContaining({ name: 'Bruno Lima' }),
      ],
    });
  });

  it('should find a user by id', async () => {
    const id = await signUp('Ana Souza', 'ana@loja.dev');

    const response = await app.inject({ method: 'GET', url: `/users/${id}` });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: { id, name: 'Ana Souza', email: 'ana@loja.dev', role: 'CUSTOMER' },
    });
  });

  it('should answer 404 to an id nobody has', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/users/0b6f1c1e-3c55-4a4f-9a8e-2d8f6f7b9c10',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      error: { code: 'USER_NOT_FOUND' },
    });
  });

  it('should answer 400 to an id that is not a UUID', async () => {
    const response = await app.inject({ method: 'GET', url: '/users/42' });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ error: { code: 'INVALID_ID' } });
  });
});
