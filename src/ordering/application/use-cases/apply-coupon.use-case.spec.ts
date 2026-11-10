import { aCoupon } from '../../domain/__tests__/coupon.builder.js';
import { anOrder } from '../../domain/__tests__/order.builder.js';
import { InMemoryCouponRepository } from '../__tests__/in-memory-coupon.repository.js';
import { InMemoryOrderRepository } from '../__tests__/in-memory-order.repository.js';
import { ApplyCouponUseCase } from './apply-coupon.use-case.js';
import { RemoveCouponUseCase } from './remove-coupon.use-case.js';

const ORDER_ID = '01890a5d-ac96-774b-bcce-b302099a8058';

describe('ApplyCouponUseCase and RemoveCouponUseCase', () => {
  let orders: InMemoryOrderRepository;
  let coupons: InMemoryCouponRepository;

  beforeEach(async () => {
    orders = new InMemoryOrderRepository();
    coupons = new InMemoryCouponRepository();
    await coupons.save(
      aCoupon().withCode('AGIL10').withPercentage(10, 2000).build(),
    );
    await orders.save(
      anOrder()
        .withId(ORDER_ID)
        .withItems({ sku: 'CAN001', unitPriceInCents: 4990, quantity: 2 })
        .build(),
    );
  });

  it('should apply a coupon by its code', async () => {
    const applyCoupon = new ApplyCouponUseCase(orders, coupons);

    const output = await applyCoupon.execute({
      orderId: ORDER_ID,
      code: 'agil10',
    });

    expect(output).toMatchObject({
      couponCode: 'AGIL10',
      subtotalInCents: 9980,
      discountInCents: 998,
      totalInCents: 8982,
    });
  });

  it('should reject an unknown coupon', async () => {
    const applyCoupon = new ApplyCouponUseCase(orders, coupons);

    await expect(
      applyCoupon.execute({ orderId: ORDER_ID, code: 'NADA' }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'COUPON_NOT_FOUND',
        message: 'Cupom "NADA" não encontrado.',
      }),
    );
  });

  it('should remove the coupon', async () => {
    await new ApplyCouponUseCase(orders, coupons).execute({
      orderId: ORDER_ID,
      code: 'AGIL10',
    });

    const output = await new RemoveCouponUseCase(orders).execute({
      orderId: ORDER_ID,
    });

    expect(output).toMatchObject({ couponCode: null, totalInCents: 9980 });
  });
});
