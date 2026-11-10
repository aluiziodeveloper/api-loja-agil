import { Money } from '../../../shared/domain/money.value-object.js';
import { ValidUntil } from './valid-until.rule.js';

const END_OF_DAY = new Date('2026-11-30T23:59:59.999Z');
const NEXT_DAY = new Date('2026-12-01T00:00:00.000Z');
const ANY_SUBTOTAL = Money.fromCents(1);

describe('ValidUntil', () => {
  it('should be valid up to its last instant', () => {
    const rule = new ValidUntil(END_OF_DAY);

    expect(rule.isSatisfiedBy({ subtotal: ANY_SUBTOTAL, at: END_OF_DAY })).toBe(
      true,
    );
    expect(rule.isSatisfiedBy({ subtotal: ANY_SUBTOTAL, at: NEXT_DAY })).toBe(
      false,
    );
  });
});
