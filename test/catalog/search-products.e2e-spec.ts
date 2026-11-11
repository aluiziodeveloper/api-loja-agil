import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ProductRepository } from '../../src/catalog/application/ports/product.repository.js';
import { aProduct } from '../../src/catalog/domain/__tests__/product.builder.js';
import { PrismaDatabase } from '../../src/shared/infrastructure/database/prisma-database.js';
import { resetDatabase } from '../../src/shared/infrastructure/database/__tests__/reset-database.js';
import { createTestApp } from '../setup/create-test-app.js';

describe('GET /products (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase(app.get(PrismaDatabase));
    const products = app.get(ProductRepository);
    await products.save(
      aProduct()
        .withSku('CAN001')
        .withName('Caneca Ágil')
        .withPriceInCents(4590)
        .build(),
    );
    await products.save(
      aProduct()
        .withSku('CAM001')
        .withName('Camiseta Scrum')
        .withPriceInCents(7990)
        .build(),
    );
    await products.save(
      aProduct()
        .withSku('ADE001')
        .withName('Adesivo Kanban')
        .withPriceInCents(990)
        .build(),
    );
    await products.save(
      aProduct().withSku('BON001').withName('Boné Sprint').inactive().build(),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  const search = (query = '') =>
    app.inject({ method: 'GET', url: `/products${query}` });

  const namesOf = (response: Awaited<ReturnType<typeof search>>) =>
    response.json<{ data: { name: string }[] }>().data.map(({ name }) => name);

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
