import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createTestApp } from './setup/create-test-app.js';

describe('Authentication (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  const unauthorized = {
    error: {
      code: 'UNAUTHORIZED',
      message: 'Token de acesso ausente ou inválido.',
    },
  };

  it('should answer 401 to a protected route without a token', async () => {
    const response = await app.inject({ method: 'GET', url: '/users' });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual(unauthorized);
  });

  it('should answer 401 to a token it did not issue', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/users',
      headers: { authorization: 'Bearer abc.def.ghi' },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual(unauthorized);
  });

  it('should no longer accept the provisional x-customer-id header', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/orders',
      headers: { 'x-customer-id': '0b6f1c1e-3c55-4a4f-9a8e-2d8f6f7b9c10' },
    });

    expect(response.statusCode).toBe(401);
  });

  it.each([
    ['GET', '/health'],
    ['GET', '/products'],
  ] as const)('should keep %s %s open to anyone', async (method, url) => {
    const response = await app.inject({ method, url });

    expect(response.statusCode).toBe(200);
  });
});
