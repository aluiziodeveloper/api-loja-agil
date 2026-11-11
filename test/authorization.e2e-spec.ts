import { JwtService } from '@nestjs/jwt';
import { customer, OPERATOR } from './setup/auth.js';
import { useTestApp } from './setup/e2e.js';
import { dataOf } from './setup/test-client.js';

const ANA = '0b6f1c1e-3c55-4a4f-9a8e-2d8f6f7b9c10';

describe('Authorization by role (e2e)', () => {
  const e2e = useTestApp();
  const api = e2e.api;
  const operator = e2e.as(OPERATOR);
  const ana = e2e.as(customer(ANA));

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
      const response = await ana.request(method, url);

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
    await api.post('/users', {
      name: 'Bia Lima',
      email: 'bia@loja.dev',
      password: 'caneca123',
    });

    const promoted = await operator.post('/operators', {
      email: 'bia@loja.dev',
    });
    const signIn = await api.post('/auth/sign-in', {
      email: 'bia@loja.dev',
      password: 'caneca123',
    });

    expect(promoted.statusCode).toBe(200);
    expect(promoted.json()).toMatchObject({ data: { role: 'OPERATOR' } });
    const { accessToken } = dataOf<{ accessToken: string }>(signIn);
    expect(new JwtService().decode(accessToken)).toMatchObject({
      role: 'OPERATOR',
    });
  });

  it('should answer 404 when promoting an e-mail nobody uses', async () => {
    const response = await operator.post('/operators', {
      email: 'ninguem@loja.dev',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      error: { code: 'USER_NOT_FOUND' },
    });
  });
});
