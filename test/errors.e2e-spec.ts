import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createTestApp } from './setup/create-test-app.js';
import { TestClient } from './setup/test-client.js';

describe('Error responses (e2e)', () => {
  let app: NestFastifyApplication;
  let api: TestClient;

  beforeAll(async () => {
    app = await createTestApp();
    api = TestClient.anonymous(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should answer an unknown route in the same format', async () => {
    const response = await api.get('/nada');

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: { code: 'NOT_FOUND', message: 'Cannot GET /nada' },
    });
  });

  it('should answer a body that is not JSON in the same format', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users',
      headers: { 'content-type': 'application/json' },
      payload: '{"name":',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ error: { code: 'BAD_REQUEST' } });
  });
});
