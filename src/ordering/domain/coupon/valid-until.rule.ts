import type { Specification } from '../specification.js';
import type { CouponCandidate } from './coupon-candidate.js';

/** O cupom vale até o instante de expiração, inclusive. */
export class ValidUntil implements Specification<CouponCandidate> {
  constructor(private readonly expiresAt: Date) {}

  isSatisfiedBy({ at }: CouponCandidate): boolean {
    return at.getTime() <= this.expiresAt.getTime();
  }
}
