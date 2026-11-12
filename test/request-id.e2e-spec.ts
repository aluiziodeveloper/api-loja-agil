import { useTestApp } from './setup/e2e.js';

describe('request id (e2e)', () => {
  const e2e = useTestApp();

  it('should give each response the id that its log lines carry', async () => {
    const response = await e2e.api.get('/products');

    expect(response.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('should keep the id sent by the proxy', async () => {
    const response = await e2e.app.inject({
      method: 'GET',
      url: '/products',
      headers: { 'x-request-id': 'proxy-42' },
    });

    expect(response.headers['x-request-id']).toBe('proxy-42');
  });
});
