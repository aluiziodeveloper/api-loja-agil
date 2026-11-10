import type { Money } from '../../../shared/domain/money.value-object.js';
import type { Specification } from '../specification.js';
import type { CouponCandidate } from './coupon-candidate.js';

/** O subtotal do pedido precisa chegar ao valor mínimo do cupom (RN14). */
export class MinimumOrderValue implements Specification<CouponCandidate> {
  constructor(private readonly minimum: Money) {}

  isSatisfiedBy({ subtotal }: CouponCandidate): boolean {
    return !subtotal.isLessThan(this.minimum);
  }
}
