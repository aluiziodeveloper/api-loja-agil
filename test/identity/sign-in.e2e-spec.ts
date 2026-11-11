import { JwtService } from '@nestjs/jwt';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { PrismaDatabase } from '../../src/shared/infrastructure/database/prisma-database.js';
import { resetDatabase } from '../../src/shared/infrastructure/database/__tests__/reset-database.js';
import { createTestApp } from '../setup/create-test-app.js';
import { dataOf, TestClient } from '../setup/test-client.js';

describe('POST /auth/sign-in (e2e)', () => {
  let app: NestFastifyApplication;
  let api: TestClient;
  let anaId: string;

  beforeAll(async () => {
    app = await createTestApp();
    api = TestClient.anonymous(app);
  });

  beforeEach(async () => {
    await resetDatabase(app.get(PrismaDatabase));
    const signUp = await api.post('/users', {
      name: 'Ana Souza',
      email: 'ana@loja.dev',
      password: 'caneca123',
    });
    anaId = dataOf<{ id: string }>(signUp).id;
  });

  afterAll(async () => {
    await app.close();
  });

  const signIn = (payload: object) => api.post('/auth/sign-in', payload);

  it('should answer 200 with an access token for the user', async () => {
    const response = await signIn({
      email: 'ana@loja.dev',
      password: 'caneca123',
    });

    expect(response.statusCode).toBe(200);
    const data = dataOf<{ accessToken: string }>(response);
    expect(data).toMatchObject({ tokenType: 'Bearer', expiresInSeconds: 3600 });
    expect(new JwtService().decode(data.accessToken)).toMatchObject({
      sub: anaId,
      role: 'CUSTOMER',
    });
  });

  it.each([
    ['a wrong password', { email: 'ana@loja.dev', password: 'caneca124' }],
    ['an unknown e-mail', { email: 'bia@loja.dev', password: 'caneca123' }],
  ])('should answer the same 401 to %s', async (_, payload) => {
    const response = await signIn(payload);

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'E-mail ou senha inválidos.',
      },
    });
  });
});
