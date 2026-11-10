import { InvalidCouponError } from './invalid-coupon.error.js';
import type { Money } from './money.js';
import { ValueObject } from '../../src/shared/domain/value-object.js';

const KNOWN_COUPON = 'AGIL10';
const DISCOUNT_PERCENT = 10;

export class Coupon extends ValueObject<{ code: string }> {
  static from(code: string): Coupon {
    if (code !== KNOWN_COUPON) {
      throw new InvalidCouponError(code);
    }
    return new Coupon({ code });
  }

  applyTo(amount: Money): Money {
    return amount.percentOff(DISCOUNT_PERCENT);
  }
}
