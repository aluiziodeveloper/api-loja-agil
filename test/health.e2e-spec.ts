import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createTestApp } from './setup/create-test-app.js';
import { TestClient } from './setup/test-client.js';

describe('GET /health (e2e)', () => {
  let app: NestFastifyApplication;
  let api: TestClient;

  beforeAll(async () => {
    app = await createTestApp();
    api = TestClient.anonymous(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 200 with status ok', async () => {
    const response = await api.get('/health');

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ data: { status: 'ok' } });
  });
});
