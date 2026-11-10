import { Money } from '../../../shared/domain/money.value-object.js';
import { CouponCode } from './coupon-code.value-object.js';
import { Coupon } from './coupon.entity.js';
import type { CouponSnapshot } from './coupon.snapshot.js';
import { PercentageDiscount } from './percentage-discount.js';

const EXPIRES_AT = new Date('2026-11-30T23:59:59.999Z');
const BEFORE_EXPIRY = new Date('2026-11-10T12:00:00.000Z');
const AFTER_EXPIRY = new Date('2026-12-01T00:00:00.000Z');

const storedCoupon: CouponSnapshot = {
  id: '01890a5d-ac96-774b-bcce-b302099a8060',
  code: 'AGIL10',
  discount: { type: 'PERCENTAGE', percent: 10, capInCents: 2000 },
  minimumOrderInCents: 10_000,
  expiresAt: EXPIRES_AT,
};

describe('Coupon', () => {
  it('should be created and rebuilt from its snapshot', () => {
    const coupon = Coupon.create({
      code: CouponCode.create('agil10'),
      discount: PercentageDiscount.of(10, Money.fromCents(2000)),
      minimumOrder: Money.fromCents(10_000),
      expiresAt: EXPIRES_AT,
    });

    expect(coupon.toSnapshot()).toEqual({
      ...storedCoupon,
      id: coupon.id.toString(),
    });
    expect(Coupon.restore(storedCoupon).toSnapshot()).toEqual(storedCoupon);
  });

  it('should rebuild a fixed amount discount', () => {
    const snapshot: CouponSnapshot = {
      ...storedCoupon,
      discount: { type: 'FIXED_AMOUNT', amountInCents: 1500 },
    };

    const coupon = Coupon.restore(snapshot);

    expect(coupon.toSnapshot()).toEqual(snapshot);
    expect(coupon.discountFor(Money.fromCents(20_000), BEFORE_EXPIRY)).toEqual(
      Money.fromCents(1500),
    );
  });

  it('should give its discount to an eligible order', () => {
    const coupon = Coupon.restore(storedCoupon);

    expect(coupon.discountFor(Money.fromCents(15_000), BEFORE_EXPIRY)).toEqual(
      Money.fromCents(1500),
    );
  });

  it.each([
    {
      when: 'below the minimum order value',
      subtotal: 9999,
      at: BEFORE_EXPIRY,
    },
    { when: 'after it expires', subtotal: 15_000, at: AFTER_EXPIRY },
  ])('should refuse an order $when', ({ subtotal, at }) => {
    const coupon = Coupon.restore(storedCoupon);

    expect(coupon.isApplicableTo(Money.fromCents(subtotal), at)).toBe(false);
    expect(() => coupon.discountFor(Money.fromCents(subtotal), at)).toThrow(
      expect.objectContaining({
        code: 'COUPON_NOT_APPLICABLE',
        message: 'O cupom "AGIL10" não vale para este pedido.',
      }),
    );
  });
});
