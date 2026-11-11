import { aCoupon } from '../../domain/__tests__/coupon.builder.js';
import { CouponCode } from '../../domain/coupon/coupon-code.value-object.js';
import type { CouponRepository } from '../ports/coupon.repository.js';

/** O comportamento que toda implementação de `CouponRepository` precisa ter. */
export function couponRepositoryContract(
  createRepository: () => Promise<CouponRepository>,
): void {
  let coupons: CouponRepository;

  beforeEach(async () => {
    coupons = await createRepository();
  });

  it('should find a saved coupon by code, as a new instance', async () => {
    const coupon = aCoupon().withCode('NATAL2026').build();
    await coupons.save(coupon);

    const found = await coupons.findByCode(CouponCode.create('natal2026'));

    expect(found).not.toBe(coupon);
    expect(found?.toSnapshot()).toEqual(coupon.toSnapshot());
    expect(await coupons.findByCode(CouponCode.create('NADA'))).toBeNull();
  });

  it.each([
    { kind: 'percentage', coupon: () => aCoupon().withPercentage(15, 3000) },
    { kind: 'fixed amount', coupon: () => aCoupon().withFixedAmount(1990) },
  ])('should keep a $kind discount as it was', async ({ coupon }) => {
    const saved = coupon()
      .withCode('PROMO2026')
      .withMinimumOrder(5000)
      .withExpiresAt(new Date('2026-12-31T23:59:59.999Z'))
      .build();
    await coupons.save(saved);

    const found = await coupons.findByCode(CouponCode.create('PROMO2026'));

    expect(found?.toSnapshot()).toEqual(saved.toSnapshot());
  });

  it('should save the same coupon twice without duplicating it', async () => {
    const coupon = aCoupon().withCode('NATAL2026').build();

    await coupons.save(coupon);
    await coupons.save(coupon);

    expect(
      (await coupons.findByCode(CouponCode.create('NATAL2026')))?.toSnapshot(),
    ).toEqual(coupon.toSnapshot());
  });
}
