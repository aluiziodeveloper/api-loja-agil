import { useTestApp } from './setup/e2e.js';

describe('Error responses (e2e)', () => {
  const e2e = useTestApp();
  const api = e2e.api;

  it('should answer an unknown route in the same format', async () => {
    const response = await api.get('/nada');

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: { code: 'NOT_FOUND', message: 'Cannot GET /nada' },
    });
  });

  it('should answer a body that is not JSON in the same format', async () => {
    const response = await e2e.app.inject({
      method: 'POST',
      url: '/users',
      headers: { 'content-type': 'application/json' },
      payload: '{"name":',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ error: { code: 'BAD_REQUEST' } });
  });
});
