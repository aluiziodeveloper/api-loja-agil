import type { Coupon } from '../../domain/coupon/coupon.entity.js';
import type { CouponCode } from '../../domain/coupon/coupon-code.value-object.js';

export interface CouponRepository {
  save(coupon: Coupon): Promise<void>;
  findByCode(code: CouponCode): Promise<Coupon | null>;
}
