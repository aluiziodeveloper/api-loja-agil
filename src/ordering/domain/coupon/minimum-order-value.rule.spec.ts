import { Money } from '../../../shared/domain/money.value-object.js';
import { MinimumOrderValue } from './minimum-order-value.rule.js';

const AT = new Date('2026-11-10T12:00:00.000Z');

describe('MinimumOrderValue', () => {
  it('should require a minimum order value (RN14)', () => {
    const rule = new MinimumOrderValue(Money.fromCents(10_000));

    expect(
      rule.isSatisfiedBy({ subtotal: Money.fromCents(10_000), at: AT }),
    ).toBe(true);
    expect(
      rule.isSatisfiedBy({ subtotal: Money.fromCents(9999), at: AT }),
    ).toBe(false);
  });
});
