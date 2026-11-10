import { Money } from '../../../shared/domain/money.value-object.js';
import type { DiscountSnapshot } from './coupon.snapshot.js';
import type { DiscountPolicy } from './discount-policy.js';
import { FixedAmountDiscount } from './fixed-amount-discount.js';
import { PercentageDiscount } from './percentage-discount.js';

/** O único lugar que conhece todos os tipos de desconto: a volta do banco. */
export function discountPolicyFrom(snapshot: DiscountSnapshot): DiscountPolicy {
  if (snapshot.type === 'PERCENTAGE') {
    return PercentageDiscount.of(
      snapshot.percent,
      Money.fromCents(snapshot.capInCents),
    );
  }
  return FixedAmountDiscount.of(Money.fromCents(snapshot.amountInCents));
}
