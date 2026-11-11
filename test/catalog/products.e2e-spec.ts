import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { PrismaDatabase } from '../../src/shared/infrastructure/database/prisma-database.js';
import { resetDatabase } from '../../src/shared/infrastructure/database/__tests__/reset-database.js';
import { createTestApp } from '../setup/create-test-app.js';

type ProductBody = { data: { id: string; active: boolean } };

describe('Products (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase(app.get(PrismaDatabase));
  });

  afterAll(async () => {
    await app.close();
  });

  const caneca = { sku: 'CAN001', name: 'Caneca Ágil', priceInCents: 4590 };

  const create = (payload: object = caneca) =>
    app.inject({ method: 'POST', url: '/products', payload });

  async function createdId(): Promise<string> {
    return (await create()).json<ProductBody>().data.id;
  }

  it('should create a product and answer 201', async () => {
    const response = await create();

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      data: { id: expect.any(String), ...caneca, active: true },
    });
  });

  it('should answer 409 to a SKU already in use', async () => {
    await create();

    const response = await create({ ...caneca, name: 'Outra caneca' });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({
      error: { code: 'SKU_ALREADY_IN_USE' },
    });
  });

  it.each([
    ['INVALID_SKU', { ...caneca, sku: 'CANECA_AGIL' }],
    ['INVALID_PRODUCT_NAME', { ...caneca, name: 'C' }],
    ['INVALID_MONEY', { ...caneca, priceInCents: 45.9 }],
  ])('should answer 400 %s to a rule broken', async (code, payload) => {
    const response = await create(payload);

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ error: { code } });
  });

  it('should find a product by id', async () => {
    const id = await createdId();

    const response = await app.inject({
      method: 'GET',
      url: `/products/${id}`,
    });

    expect(response.json()).toEqual({ data: { id, ...caneca, active: true } });
  });

  it('should change only what the PATCH brings', async () => {
    const id = await createdId();

    const response = await app.inject({
      method: 'PATCH',
      url: `/products/${id}`,
      payload: { priceInCents: 3990 },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      data: { name: 'Caneca Ágil', priceInCents: 3990 },
    });
  });

  it('should deactivate and activate again, answering 200', async () => {
    const id = await createdId();

    const deactivated = await app.inject({
      method: 'POST',
      url: `/products/${id}/deactivate`,
    });
    const activated = await app.inject({
      method: 'POST',
      url: `/products/${id}/activate`,
    });

    expect(deactivated.statusCode).toBe(200);
    expect(deactivated.json<ProductBody>().data.active).toBe(false);
    expect(activated.json<ProductBody>().data.active).toBe(true);
  });

  it('should answer 404 to a product nobody created', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/products/0b6f1c1e-3c55-4a4f-9a8e-2d8f6f7b9c10/activate',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      error: { code: 'PRODUCT_NOT_FOUND' },
    });
  });
});
