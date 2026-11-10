import { aCoupon } from '../../domain/__tests__/coupon.builder.js';
import { CouponCode } from '../../domain/coupon/coupon-code.value-object.js';
import { InMemoryCouponRepository } from './in-memory-coupon.repository.js';

describe('InMemoryCouponRepository', () => {
  it('should find a saved coupon by code, as a new instance', async () => {
    const coupons = new InMemoryCouponRepository();
    const coupon = aCoupon().withCode('NATAL2026').build();
    await coupons.save(coupon);

    const found = await coupons.findByCode(CouponCode.create('natal2026'));

    expect(found).not.toBe(coupon);
    expect(found?.toSnapshot()).toEqual(coupon.toSnapshot());
    expect(await coupons.findByCode(CouponCode.create('NADA'))).toBeNull();
  });
});
