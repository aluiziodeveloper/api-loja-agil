import { useTestApp } from './setup/e2e.js';

describe('OpenAPI (e2e)', () => {
  const e2e = useTestApp();
  const api = e2e.api;

  it('should serve the document without a token', async () => {
    const response = await api.get('/docs-json');

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      openapi: expect.stringMatching(/^3\./),
      info: { title: 'API Loja Ágil' },
    });
  });

  it('should serve the Swagger UI without a token', async () => {
    const response = await api.get('/docs');

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('text/html');
  });

  it('should list every route of the application', async () => {
    const { paths } = (await api.get('/docs-json')).json<{
      paths: Record<string, object>;
    }>();

    expect(Object.keys(paths)).toEqual(
      expect.arrayContaining(['/products', '/orders/{id}/place', '/me']),
    );
  });

  it('should name each operation after its use case', async () => {
    const { paths } = (await api.get('/docs-json')).json<{
      paths: Record<string, Record<string, { operationId: string }>>;
    }>();

    expect(paths['/products']?.['post']?.operationId).toBe('createProduct');
    expect(paths['/orders/{id}/place']?.['post']?.operationId).toBe(
      'placeOrder',
    );
  });

  it('should group the operations by bounded context', async () => {
    const { paths } = (await api.get('/docs-json')).json<{
      paths: Record<string, Record<string, { tags: string[] }>>;
    }>();

    expect(paths['/products']?.['post']?.tags).toEqual(['Catálogo']);
    expect(paths['/stock/{sku}']?.['get']?.tags).toEqual(['Estoque']);
    expect(paths['/coupons']?.['post']?.tags).toEqual(['Pedidos']);
    expect(paths['/me']?.['get']?.tags).toEqual(['Identidade']);
  });
});
