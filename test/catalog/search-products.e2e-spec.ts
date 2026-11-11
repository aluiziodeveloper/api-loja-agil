import { OPERATOR } from '../setup/auth.js';
import { useTestApp } from '../setup/e2e.js';
import { givenProduct, MUG } from '../setup/scenarios.js';
import { dataOf } from '../setup/test-client.js';

describe('GET /products (e2e)', () => {
  const e2e = useTestApp();
  const api = e2e.api;
  const operator = e2e.as(OPERATOR);

  beforeEach(async () => {
    await givenProduct(operator, MUG);
    await givenProduct(operator, {
      sku: 'CAM001',
      name: 'Camiseta Scrum',
      priceInCents: 7990,
    });
    await givenProduct(operator, {
      sku: 'ADE001',
      name: 'Adesivo Kanban',
      priceInCents: 990,
    });
    const bone = await givenProduct(operator, {
      sku: 'BON001',
      name: 'Boné Sprint',
      priceInCents: 3990,
    });
    await operator.post(`/products/${bone}/deactivate`);
  });

  const search = (query = '') => api.get(`/products${query}`);

  const namesOf = (response: Awaited<ReturnType<typeof search>>) =>
    dataOf<{ name: string }[]>(response).map(({ name }) => name);

  it('should answer the first page of active products, by name', async () => {
    const response = await search();

    expect(response.statusCode).toBe(200);
    expect(namesOf(response)).toEqual([
      'Adesivo Kanban',
      'Camiseta Scrum',
      'Caneca Ágil',
    ]);
    expect(response.json()).toMatchObject({
      meta: { total: 3, page: 1, perPage: 15, lastPage: 1 },
    });
  });

  it('should page, sort and filter as the query string asks', async () => {
    const response = await search(
      '?page=2&perPage=1&sort=price&sortDirection=desc&filter=ca',
    );

    expect(namesOf(response)).toEqual(['Caneca Ágil']);
    expect(response.json()).toMatchObject({
      meta: { total: 2, page: 2, perPage: 1, lastPage: 2 },
    });
  });

  it('should include inactive products when asked', async () => {
    const response = await search('?includeInactive=true');

    expect(namesOf(response)).toContain('Boné Sprint');
  });

  it('should answer 400 VALIDATION_FAILED to a page that is not a number', async () => {
    const response = await search('?page=abc');

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: { code: 'VALIDATION_FAILED', details: [{ path: 'page' }] },
    });
  });

  it('should answer 400 INVALID_SEARCH_PARAMS to a page out of the limits', async () => {
    const response = await search('?perPage=500');

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: {
        code: 'INVALID_SEARCH_PARAMS',
        message:
          'Parâmetros de busca inválidos: perPage deve ser um inteiro entre 1 e 100.',
      },
    });
  });
});
