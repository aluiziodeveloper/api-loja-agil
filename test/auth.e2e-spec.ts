import { JwtService } from '@nestjs/jwt';
import { useTestApp } from './setup/e2e.js';

describe('Authentication (e2e)', () => {
  const e2e = useTestApp();
  const api = e2e.api;

  const unauthorized = {
    error: {
      code: 'UNAUTHORIZED',
      message: 'Token de acesso ausente ou inválido.',
    },
  };

  it('should answer 401 to a protected route without a token', async () => {
    const response = await api.get('/users');

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual(unauthorized);
  });

  it('should answer 401 to a token it did not issue', async () => {
    const response = await e2e.app.inject({
      method: 'GET',
      url: '/users',
      headers: { authorization: 'Bearer abc.def.ghi' },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual(unauthorized);
  });

  it.each([
    ['expired', { expiresIn: -1 }],
    ['signed with HS512', { algorithm: 'HS512' as const }],
    ['signed with another secret', { secret: 'x'.repeat(32) }],
  ])('should answer 401 to a token %s', async (_, options) => {
    const token = await new JwtService({
      secret: 'e2e-secret-with-at-least-32-characters',
    }).signAsync(
      { sub: '9d1e2f3a-4b5c-4d6e-8f70-81a2b3c4d5e6', role: 'OPERATOR' },
      options,
    );

    const response = await e2e.app.inject({
      method: 'GET',
      url: '/users',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual(unauthorized);
  });

  it('should no longer accept the provisional x-customer-id header', async () => {
    const response = await e2e.app.inject({
      method: 'POST',
      url: '/orders',
      headers: { 'x-customer-id': '0b6f1c1e-3c55-4a4f-9a8e-2d8f6f7b9c10' },
    });

    expect(response.statusCode).toBe(401);
  });

  it.each([
    ['GET', '/health'],
    ['GET', '/health/ready'],
    ['GET', '/products'],
  ] as const)('should keep %s %s open to anyone', async (method, url) => {
    const response = await api.request(method, url);

    expect(response.statusCode).toBe(200);
  });
});
