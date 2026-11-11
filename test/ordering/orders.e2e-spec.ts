import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { PrismaDatabase } from '../../src/shared/infrastructure/database/prisma-database.js';
import { resetDatabase } from '../../src/shared/infrastructure/database/__tests__/reset-database.js';
import { createTestApp } from '../setup/create-test-app.js';

const ANA = '0b6f1c1e-3c55-4a4f-9a8e-2d8f6f7b9c10';
const BRUNO = '6a2f41a3-c54b-4b4e-8c1a-5d3e2f1a0b9c';

type OrderBody = { data: { id: string; status: string } };

describe('Orders (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase(app.get(PrismaDatabase));
    await app.inject({
      method: 'POST',
      url: '/products',
      payload: { sku: 'CAN001', name: 'Caneca Ágil', priceInCents: 4590 },
    });
    await app.inject({
      method: 'POST',
      url: '/stock/CAN001/receipts',
      payload: { quantity: 3 },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  const asCustomer = (customerId: string) => ({
    'x-customer-id': customerId,
  });

  async function draftWith(quantity: number): Promise<string> {
    const draft = await app.inject({
      method: 'POST',
      url: '/orders',
      headers: asCustomer(ANA),
    });
    const { id } = draft.json<OrderBody>().data;
    await app.inject({
      method: 'POST',
      url: `/orders/${id}/items`,
      payload: { sku: 'CAN001', quantity },
    });
    return id;
  }

  const transition = (id: string, action: string) =>
    app.inject({ method: 'POST', url: `/orders/${id}/${action}` });

  const stockOf = async (sku: string) =>
    (await app.inject({ method: 'GET', url: `/stock/${sku}` })).json<{
      data: { onHand: number; reserved: number };
    }>().data;

  it('should open a draft for the customer of the request', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/orders',
      headers: asCustomer(ANA),
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      data: { customerId: ANA, status: 'DRAFT', items: [], totalInCents: 0 },
    });
  });

  it('should answer 401 when nobody says who the customer is', async () => {
    const response = await app.inject({ method: 'POST', url: '/orders' });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Informe o cliente no header x-customer-id.',
      },
    });
  });

  it('should add an item at the price of the catalog', async () => {
    const id = await draftWith(2);

    const response = await app.inject({ method: 'GET', url: `/orders/${id}` });

    expect(response.json()).toMatchObject({
      data: {
        items: [
          {
            sku: 'CAN001',
            unitPriceInCents: 4590,
            quantity: 2,
            subtotalInCents: 9180,
          },
        ],
        totalInCents: 9180,
      },
    });
  });

  it('should reserve the stock when the order is placed', async () => {
    const id = await draftWith(2);

    const response = await transition(id, 'place');

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ data: { status: 'PLACED' } });
    await expect(stockOf('CAN001')).resolves.toMatchObject({
      onHand: 3,
      reserved: 2,
    });
  });

  it('should keep the order as a draft when the stock is short', async () => {
    const id = await draftWith(5);

    const response = await transition(id, 'place');

    expect(response.statusCode).toBe(422);
    expect(response.json()).toEqual({
      error: {
        code: 'STOCK_SHORTAGE',
        message: 'Estoque insuficiente: CAN001 (solicitado 5, disponível 3).',
      },
    });
    const order = await app.inject({ method: 'GET', url: `/orders/${id}` });
    expect(order.json()).toMatchObject({ data: { status: 'DRAFT' } });
  });

  it('should take the units out when paid and give them back when cancelled', async () => {
    const id = await draftWith(2);
    await transition(id, 'place');

    await transition(id, 'pay');
    const afterPayment = await stockOf('CAN001');
    await transition(id, 'cancel');
    const afterCancel = await stockOf('CAN001');

    expect(afterPayment).toMatchObject({ onHand: 1, reserved: 0 });
    expect(afterCancel).toMatchObject({ onHand: 3, reserved: 0 });
  });

  it('should answer 409 to a transition out of the lifecycle', async () => {
    const id = await draftWith(1);

    const response = await transition(id, 'ship');

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({
      error: { code: 'INVALID_ORDER_TRANSITION' },
    });
  });

  it('should remove an item from the draft', async () => {
    const id = await draftWith(1);

    const response = await app.inject({
      method: 'DELETE',
      url: `/orders/${id}/items/CAN001`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ data: { items: [] } });
  });

  it('should list only the orders of the customer, the newest first', async () => {
    const first = await draftWith(1);
    const second = await draftWith(1);
    await app.inject({
      method: 'POST',
      url: '/orders',
      headers: asCustomer(BRUNO),
    });

    const response = await app.inject({
      method: 'GET',
      url: '/orders',
      headers: asCustomer(ANA),
    });

    expect(
      response.json<{ data: { id: string }[] }>().data.map(({ id }) => id),
    ).toEqual([second, first]);
    expect(response.json()).toMatchObject({ meta: { total: 2 } });
  });
});
