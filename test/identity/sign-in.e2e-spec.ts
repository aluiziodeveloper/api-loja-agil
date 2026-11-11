import { JwtService } from '@nestjs/jwt';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { PrismaDatabase } from '../../src/shared/infrastructure/database/prisma-database.js';
import { resetDatabase } from '../../src/shared/infrastructure/database/__tests__/reset-database.js';
import { createTestApp } from '../setup/create-test-app.js';

describe('POST /auth/sign-in (e2e)', () => {
  let app: NestFastifyApplication;
  let anaId: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase(app.get(PrismaDatabase));
    const signUp = await app.inject({
      method: 'POST',
      url: '/users',
      payload: {
        name: 'Ana Souza',
        email: 'ana@loja.dev',
        password: 'caneca123',
      },
    });
    anaId = signUp.json<{ data: { id: string } }>().data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  const signIn = (payload: object) =>
    app.inject({ method: 'POST', url: '/auth/sign-in', payload });

  it('should answer 200 with an access token for the user', async () => {
    const response = await signIn({
      email: 'ana@loja.dev',
      password: 'caneca123',
    });

    expect(response.statusCode).toBe(200);
    const { data } = response.json<{
      data: {
        accessToken: string;
        tokenType: string;
        expiresInSeconds: number;
      };
    }>();
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
