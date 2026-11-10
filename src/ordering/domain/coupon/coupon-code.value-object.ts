import { ValueObject } from '../../../shared/domain/value-object.js';
import { InvalidCouponCodeError } from './invalid-coupon-code.error.js';

const COUPON_CODE_FORMAT = /^[A-Z0-9]{4,20}$/;

/** O código que o cliente digita: sem diferença entre maiúsculas e minúsculas. */
export class CouponCode extends ValueObject<{ value: string }> {
  static create(value: string): CouponCode {
    const normalized = value.trim().toUpperCase();
    if (!COUPON_CODE_FORMAT.test(normalized)) {
      throw new InvalidCouponCodeError(value);
    }
    return new CouponCode({ value: normalized });
  }

  toString(): string {
    return this.props.value;
  }
}
