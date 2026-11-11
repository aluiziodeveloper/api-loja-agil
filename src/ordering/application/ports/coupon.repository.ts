import type { Coupon } from '../../domain/coupon/coupon.entity.js';
import type { CouponCode } from '../../domain/coupon/coupon-code.value-object.js';

export abstract class CouponRepository {
  abstract save(coupon: Coupon): Promise<void>;
  abstract findByCode(code: CouponCode): Promise<Coupon | null>;
}
