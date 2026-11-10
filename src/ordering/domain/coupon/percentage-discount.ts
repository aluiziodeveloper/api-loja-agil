import type { Money } from '../../../shared/domain/money.value-object.js';
import type { DiscountPolicy } from './discount-policy.js';
import { InvalidDiscountError } from './invalid-discount.error.js';

/** Percentual do subtotal, limitado a um teto em reais (RN14). */
export class PercentageDiscount implements DiscountPolicy {
  private constructor(
    private readonly percent: number,
    private readonly cap: Money,
  ) {}

  static of(percent: number, cap: Money): PercentageDiscount {
    if (!Number.isInteger(percent) || percent < 1 || percent > 100) {
      throw new InvalidDiscountError(
        `o percentual deve ser um inteiro de 1 a 100, e não ${percent}`,
      );
    }
    return new PercentageDiscount(percent, cap);
  }

  discountFor(subtotal: Money): Money {
    return subtotal.percentage(this.percent).min(this.cap);
  }
}
