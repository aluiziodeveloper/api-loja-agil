import { Coupon } from '../../domain/coupon/coupon.entity.js';
import type { CouponCode } from '../../domain/coupon/coupon-code.value-object.js';
import type { CouponSnapshot } from '../../domain/coupon/coupon.snapshot.js';
import type { CouponRepository } from '../ports/coupon.repository.js';

/** Guarda cópias: o snapshot tem um `Date`, e `Date` é mutável. */
export class InMemoryCouponRepository implements CouponRepository {
  private readonly snapshots = new Map<string, CouponSnapshot>();

  async save(coupon: Coupon): Promise<void> {
    const snapshot = coupon.toSnapshot();
    this.snapshots.set(snapshot.code, structuredClone(snapshot));
  }

  async findByCode(code: CouponCode): Promise<Coupon | null> {
    const snapshot = this.snapshots.get(code.toString());
    return snapshot ? Coupon.restore(structuredClone(snapshot)) : null;
  }
}
