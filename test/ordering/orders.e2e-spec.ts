import { customer, OPERATOR } from '../setup/auth.js';
import { useTestApp } from '../setup/e2e.js';
import { givenDraft, givenProduct, MUG } from '../setup/scenarios.js';
import { dataOf } from '../setup/test-client.js';

const ANA = '0b6f1c1e-3c55-4a4f-9a8e-2d8f6f7b9c10';
const BRUNO = '6a2f41a3-c54b-4b4e-8c1a-5d3e2f1a0b9c';

describe('Orders (e2e)', () => {
  const e2e = useTestApp();
  const api = e2e.api;
  const operator = e2e.as(OPERATOR);
  const ana = e2e.as(customer(ANA));
  const bruno = e2e.as(customer(BRUNO));

  beforeEach(async () => {
    await givenProduct(operator, MUG, 3);
  });

  const draftWith = (quantity: number) =>
    givenDraft(ana, [{ sku: MUG.sku, quantity }]);

  const transition = (id: string, action: string) =>
    ana.post(`/orders/${id}/${action}`);

  const stockOf = async (sku: string) =>
    dataOf<{ onHand: number; reserved: number }>(
      await operator.get(`/stock/${sku}`),
    );

  it('should open a draft for the customer of the request', async () => {
    const response = await ana.post('/orders');

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      data: { customerId: ANA, status: 'DRAFT', items: [], totalInCents: 0 },
    });
  });

  it('should answer 401 without an access token', async () => {
    const response = await api.post('/orders');

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Token de acesso ausente ou inválido.',
      },
    });
  });

  it('should add an item at the price of the catalog', async () => {
    const id = await draftWith(2);

    const response = await ana.get(`/orders/${id}`);

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
    const order = await ana.get(`/orders/${id}`);
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

    const response = await operator.post(`/orders/${id}/ship`);

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({
      error: { code: 'INVALID_ORDER_TRANSITION' },
    });
  });

  it('should remove an item from the draft', async () => {
    const id = await draftWith(1);

    const response = await ana.delete(`/orders/${id}/items/CAN001`);

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ data: { items: [] } });
  });

  it('should list only the orders of the customer, the newest first', async () => {
    const first = await draftWith(1);
    const second = await draftWith(1);
    await bruno.post('/orders');

    const response = await ana.get('/orders');

    expect(dataOf<{ id: string }[]>(response).map(({ id }) => id)).toEqual([
      second,
      first,
    ]);
    expect(response.json()).toMatchObject({ meta: { total: 2 } });
  });

  it.each([
    ['GET', ''],
    ['POST', '/items'],
    ['POST', '/place'],
    ['POST', '/cancel'],
    ['DELETE', '/coupon'],
  ] as const)(
    "should answer 404 to %s on another customer's order (RN15)",
    async (method, path) => {
      const id = await draftWith(1);

      const response = await bruno.request(method, `/orders/${id}${path}`, {
        sku: 'CAN001',
        quantity: 1,
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual({
        error: {
          code: 'ORDER_NOT_FOUND',
          message: `Pedido "${id}" não encontrado.`,
        },
      });
    },
  );
});
