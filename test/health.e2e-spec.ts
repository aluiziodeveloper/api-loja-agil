import { useTestApp } from './setup/e2e.js';

describe('GET /health (e2e)', () => {
  const e2e = useTestApp();
  const api = e2e.api;

  it('should return 200 with status ok', async () => {
    const response = await api.get('/health');

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ data: { status: 'ok' } });
  });
});
