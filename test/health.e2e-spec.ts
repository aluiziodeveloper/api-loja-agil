import { PrismaDatabase } from '../src/shared/infrastructure/database/prisma-database.js';
import { useTestApp } from './setup/e2e.js';

describe('health checks (e2e)', () => {
  const e2e = useTestApp();
  const api = e2e.api;

  it('should return 200 with status ok', async () => {
    const response = await api.get('/health');

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ data: { status: 'ok' } });
  });

  it('should be ready, without a token, when the database answers', async () => {
    const response = await api.get('/health/ready');

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: { status: 'ready', checks: { database: 'up' } },
    });
  });

  it('should answer 503 while the database does not answer', async () => {
    const database = e2e.app.get(PrismaDatabase);
    vi.spyOn(database, 'ping').mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const response = await api.get('/health/ready');

    expect(response.statusCode).toBe(503);
    expect(response.json()).toMatchObject({ error: { code: 'NOT_READY' } });
  });
});
