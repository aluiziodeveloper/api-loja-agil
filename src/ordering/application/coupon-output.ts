import type { Coupon } from '../domain/coupon/coupon.entity.js';
import type { DiscountSnapshot } from '../domain/coupon/coupon.snapshot.js';

export type CouponOutput = {
  code: string;
  discount: DiscountSnapshot;
  minimumOrderInCents: number;
  expiresAt: string;
};

export function toCouponOutput(coupon: Coupon): CouponOutput {
  const { code, discount, minimumOrderInCents, expiresAt } =
    coupon.toSnapshot();
  return {
    code,
    discount,
    minimumOrderInCents,
    expiresAt: expiresAt.toISOString(),
  };
}
