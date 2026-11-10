import { Money } from '../../../shared/domain/money.value-object.js';
import type { DiscountPolicy } from './discount-policy.js';
import { InvalidDiscountError } from './invalid-discount.error.js';

/** Um valor fixo em reais, nunca maior que o subtotal. */
export class FixedAmountDiscount implements DiscountPolicy {
  private constructor(private readonly amount: Money) {}

  static of(amount: Money): FixedAmountDiscount {
    if (!amount.isGreaterThan(Money.zero())) {
      throw new InvalidDiscountError('o valor deve ser maior que zero');
    }
    return new FixedAmountDiscount(amount);
  }

  discountFor(subtotal: Money): Money {
    return this.amount.min(subtotal);
  }
}
