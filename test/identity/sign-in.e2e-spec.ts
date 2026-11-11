import { JwtService } from '@nestjs/jwt';
import { useTestApp } from '../setup/e2e.js';
import { givenUser } from '../setup/scenarios.js';
import { dataOf } from '../setup/test-client.js';

describe('POST /auth/sign-in (e2e)', () => {
  const e2e = useTestApp();
  const api = e2e.api;

  let anaId: string;

  beforeEach(async () => {
    anaId = await givenUser(api, {
      name: 'Ana Souza',
      email: 'ana@loja.dev',
      password: 'caneca123',
    });
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
