import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { PrismaDatabase } from '../../src/shared/infrastructure/database/prisma-database.js';
import { resetDatabase } from '../../src/shared/infrastructure/database/__tests__/reset-database.js';
import { createTestApp } from '../setup/create-test-app.js';

describe('Stock (e2e)', () => {
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

  const receive = (quantity: number) =>
    app.inject({
      method: 'POST',
      url: '/stock/CAN001/receipts',
      payload: { quantity },
    });

  it('should create the stock item on the first receipt and answer 201', async () => {
    const response = await receive(10);

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      data: {
        sku: 'CAN001',
        onHand: 10,
        reserved: 0,
        available: 10,
        minimumLevel: 0,
        belowMinimum: false,
      },
    });
  });

  it('should adjust to the counted quantity, with a reason', async () => {
    await receive(10);

    const response = await app.inject({
      method: 'POST',
      url: '/stock/CAN001/adjustments',
      payload: { countedQuantity: 8, reason: 'Duas canecas quebradas' },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({ data: { onHand: 8 } });
  });

  it('should answer 400 to an adjustment without a reason', async () => {
    await receive(10);

    const response = await app.inject({
      method: 'POST',
      url: '/stock/CAN001/adjustments',
      payload: { countedQuantity: 8, reason: ' ' },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: { code: 'MISSING_ADJUSTMENT_REASON' },
    });
  });

  it('should warn when the stock falls below the minimum level', async () => {
    await receive(3);

    const response = await app.inject({
      method: 'PUT',
      url: '/stock/CAN001/minimum-level',
      payload: { minimumLevel: 5 },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      data: { minimumLevel: 5, belowMinimum: true },
    });
  });

  it('should answer 404 to a SKU without stock', async () => {
    const response = await app.inject({ method: 'GET', url: '/stock/XYZ999' });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      error: { code: 'STOCK_ITEM_NOT_FOUND' },
    });
  });

  it('should list the movements, the most recent first when asked', async () => {
    await receive(10);
    await receive(5);

    const response = await app.inject({
      method: 'GET',
      url: '/stock/CAN001/movements?sortDirection=desc&perPage=1',
    });

    expect(response.json()).toEqual({
      data: [
        {
          type: 'RECEIPT',
          onHandChange: 5,
          reservedChange: 0,
          reason: null,
          occurredAt: expect.any(String),
        },
      ],
      meta: { total: 2, page: 1, perPage: 1, lastPage: 2 },
    });
  });

  it('should never lose a receipt silently when they arrive together', async () => {
    await receive(1);

    const responses = await Promise.all(
      Array.from({ length: 5 }, () => receive(1)),
    );
    const statuses = responses.map(({ statusCode }) => statusCode);
    const accepted = statuses.filter((status) => status === 201).length;
    const stock = await app.inject({ method: 'GET', url: '/stock/CAN001' });

    expect(statuses.every((status) => [201, 409].includes(status))).toBe(true);
    for (const conflict of responses.filter(
      ({ statusCode }) => statusCode === 409,
    )) {
      expect(conflict.json()).toMatchObject({
        error: { code: 'CONCURRENT_UPDATE' },
      });
    }
    expect(stock.json()).toMatchObject({ data: { onHand: 1 + accepted } });
  });
});
