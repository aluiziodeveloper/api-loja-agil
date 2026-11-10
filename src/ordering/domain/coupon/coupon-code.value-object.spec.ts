import { CouponCode } from './coupon-code.value-object.js';
import { InvalidCouponCodeError } from './invalid-coupon-code.error.js';

describe('CouponCode', () => {
  it.each([
    ['agil10', 'AGIL10'],
    ['  natal2026 ', 'NATAL2026'],
    ['FRETE', 'FRETE'],
  ])('should normalize %j to %s', (input, expected) => {
    expect(CouponCode.create(input).toString()).toBe(expected);
  });

  it.each(['abc', 'AGIL-10', 'A'.repeat(21), ''])(
    'should reject %j',
    (input) => {
      expect(() => CouponCode.create(input)).toThrow(InvalidCouponCodeError);
    },
  );

  it('should explain the format in the message', () => {
    expect(() => CouponCode.create('ab')).toThrow(
      expect.objectContaining({
        code: 'INVALID_COUPON_CODE',
        message:
          'Código de cupom inválido: "ab". Use de 4 a 20 letras ou números.',
      }),
    );
  });
});
