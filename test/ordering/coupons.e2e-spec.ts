import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { PrismaDatabase } from '../../src/shared/infrastructure/database/prisma-database.js';
import { resetDatabase } from '../../src/shared/infrastructure/database/__tests__/reset-database.js';
import { authAs, customer, OPERATOR } from '../setup/auth.js';
import { createTestApp } from '../setup/create-test-app.js';

const ANA = '0b6f1c1e-3c55-4a4f-9a8e-2d8f6f7b9c10';

const agil10 = {
  code: 'AGIL10',
  discount: { type: 'PERCENTAGE', percent: 10, capInCents: 5000 },
  minimumOrderInCents: 5000,
  expiresAt: '2099-12-31T23:59:59.000Z',
};

describe('Coupons (e2e)', () => {
  let app: NestFastifyApplication;
  let operator: { authorization: string };
  let ana: { authorization: string };

  beforeAll(async () => {
    app = await createTestApp();
    operator = await authAs(app, OPERATOR);
    ana = await authAs(app, customer(ANA));
  });

  beforeEach(async () => {
    await resetDatabase(app.get(PrismaDatabase));
  });

  afterAll(async () => {
    await app.close();
  });

  const createCoupon = (payload: object = agil10) =>
    app.inject({ headers: operator, method: 'POST', url: '/coupons', payload });

  async function draftOf(quantity: number): Promise<string> {
    await app.inject({
      headers: operator,
      method: 'POST',
      url: '/products',
      payload: { sku: 'CAN001', name: 'Caneca Ágil', priceInCents: 4590 },
    });
    const draft = await app.inject({
      method: 'POST',
      url: '/orders',
      headers: ana,
    });
    const { id } = draft.json<{ data: { id: string } }>().data;
    await app.inject({
      headers: ana,
      method: 'POST',
      url: `/orders/${id}/items`,
      payload: { sku: 'CAN001', quantity },
    });
    return id;
  }

  const applyCoupon = (orderId: string, code = 'AGIL10') =>
    app.inject({
      headers: ana,
      method: 'PUT',
      url: `/orders/${orderId}/coupon`,
      payload: { code },
    });

  it('should create a coupon and answer 201', async () => {
    const response = await createCoupon();

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({ data: agil10 });
  });

  it('should answer 400 VALIDATION_FAILED to an unknown kind of discount', async () => {
    const response = await createCoupon({
      ...agil10,
      discount: { type: 'FREE_SHIPPING' },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: {
        code: 'VALIDATION_FAILED',
        details: [{ path: 'discount.type' }],
      },
    });
  });

  it('should answer 409 to a code already in use', async () => {
    await createCoupon();

    const response = await createCoupon();

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({
      error: { code: 'COUPON_CODE_IN_USE' },
    });
  });

  it('should apply the discount to the order, and take it out', async () => {
    await createCoupon();
    const orderId = await draftOf(2);

    const applied = await applyCoupon(orderId);
    const removed = await app.inject({
      headers: ana,
      method: 'DELETE',
      url: `/orders/${orderId}/coupon`,
    });

    expect(applied.json()).toMatchObject({
      data: {
        couponCode: 'AGIL10',
        subtotalInCents: 9180,
        discountInCents: 918,
        totalInCents: 8262,
      },
    });
    expect(removed.json()).toMatchObject({
      data: { couponCode: null, totalInCents: 9180 },
    });
  });

  it('should answer 422 when the order is below the minimum', async () => {
    await createCoupon();
    const orderId = await draftOf(1);

    const response = await applyCoupon(orderId);

    expect(response.statusCode).toBe(422);
    expect(response.json()).toMatchObject({
      error: { code: 'COUPON_NOT_APPLICABLE' },
    });
  });

  it('should answer 404 to a code nobody created', async () => {
    const orderId = await draftOf(2);

    const response = await applyCoupon(orderId, 'NADA10');

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      error: { code: 'COUPON_NOT_FOUND' },
    });
  });
});
