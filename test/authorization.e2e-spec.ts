import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { JwtService } from '@nestjs/jwt';
import { PrismaDatabase } from '../src/shared/infrastructure/database/prisma-database.js';
import { resetDatabase } from '../src/shared/infrastructure/database/__tests__/reset-database.js';
import { authAs, customer, OPERATOR } from './setup/auth.js';
import { createTestApp } from './setup/create-test-app.js';

const ANA = '0b6f1c1e-3c55-4a4f-9a8e-2d8f6f7b9c10';

describe('Authorization by role (e2e)', () => {
  let app: NestFastifyApplication;
  let operator: { authorization: string };
  let ana: { authorization: string };

  beforeAll(async () => {
    app = await createTestApp();
    operator = await authAs(app, OPERATOR);
    ana = await authAs(app, customer(ANA));
  });

  beforeEach(async () => {
    await resetDatabase(app.get(PrismaDatabase));
  });

  afterAll(async () => {
    await app.close();
  });

  it.each([
    ['GET', '/users'],
    ['POST', '/products'],
    ['PATCH', `/products/${ANA}`],
    ['POST', '/stock/CAN001/receipts'],
    ['GET', '/stock/CAN001'],
    ['POST', '/coupons'],
    ['POST', `/orders/${ANA}/ship`],
    ['POST', '/operators'],
  ] as const)(
    'should answer 403 to a customer on %s %s',
    async (method, url) => {
      const response = await app.inject({ method, url, headers: ana });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toEqual({
        error: {
          code: 'FORBIDDEN',
          message: 'Seu perfil não permite esta operação.',
        },
      });
    },
  );

  it('should let an operator promote a customer, who signs in as operator', async () => {
    await app.inject({
      method: 'POST',
      url: '/users',
      payload: {
        name: 'Bia Lima',
        email: 'bia@loja.dev',
        password: 'caneca123',
      },
    });

    const promoted = await app.inject({
      method: 'POST',
      url: '/operators',
      headers: operator,
      payload: { email: 'bia@loja.dev' },
    });
    const signIn = await app.inject({
      method: 'POST',
      url: '/auth/sign-in',
      payload: { email: 'bia@loja.dev', password: 'caneca123' },
    });

    expect(promoted.statusCode).toBe(200);
    expect(promoted.json()).toMatchObject({ data: { role: 'OPERATOR' } });
    const { accessToken } = signIn.json<{ data: { accessToken: string } }>()
      .data;
    expect(new JwtService().decode(accessToken)).toMatchObject({
      role: 'OPERATOR',
    });
  });

  it('should answer 404 when promoting an e-mail nobody uses', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/operators',
      headers: operator,
      payload: { email: 'ninguem@loja.dev' },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      error: { code: 'USER_NOT_FOUND' },
    });
  });
});
