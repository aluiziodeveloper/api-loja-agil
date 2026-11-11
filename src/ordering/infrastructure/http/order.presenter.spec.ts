import type { CouponOutput } from '../../application/coupon-output.js';
import type { OrderOutput } from '../../application/order-output.js';
import { presentCoupon, presentOrder } from './order.presenter.js';

describe('order presenters', () => {
  it('should present an order with its items and values', () => {
    const order: OrderOutput = {
      id: '0b6f1c1e-3c55-4a4f-9a8e-2d8f6f7b9c10',
      customerId: '6a2f41a3-c54b-4b4e-8c1a-5d3e2f1a0b9c',
      status: 'PLACED',
      items: [
        {
          sku: 'CAN001',
          unitPriceInCents: 4590,
          quantity: 2,
          subtotalInCents: 9180,
        },
      ],
      couponCode: null,
      subtotalInCents: 9180,
      discountInCents: 0,
      totalInCents: 9180,
      createdAt: '2026-11-11T13:00:00.000Z',
    };

    expect(presentOrder(order)).toEqual(order);
  });

  it.each<CouponOutput['discount']>([
    { type: 'PERCENTAGE', percent: 10, capInCents: 5000 },
    { type: 'FIXED_AMOUNT', amountInCents: 1500 },
  ])('should present a coupon with a $type discount', (discount) => {
    const coupon: CouponOutput = {
      code: 'AGIL10',
      discount,
      minimumOrderInCents: 10_000,
      expiresAt: '2026-12-31T23:59:59.000Z',
    };

    expect(presentCoupon(coupon)).toEqual(coupon);
  });
});
