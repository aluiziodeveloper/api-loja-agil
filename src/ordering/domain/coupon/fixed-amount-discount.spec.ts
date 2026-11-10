import { Money } from '../../../shared/domain/money.value-object.js';
import { FixedAmountDiscount } from './fixed-amount-discount.js';

function cents(value: number): Money {
  return Money.fromCents(value);
}

describe('FixedAmountDiscount', () => {
  const twentyReais = FixedAmountDiscount.of(cents(2000));

  it('should take a fixed amount off', () => {
    expect(twentyReais.discountFor(cents(15_000))).toEqual(cents(2000));
  });

  it('should never discount more than the subtotal', () => {
    expect(twentyReais.discountFor(cents(1500))).toEqual(cents(1500));
  });

  it('should reject a zero amount', () => {
    expect(() => FixedAmountDiscount.of(Money.zero())).toThrow(
      expect.objectContaining({
        code: 'INVALID_DISCOUNT',
        message: 'Desconto inválido: o valor deve ser maior que zero.',
      }),
    );
  });
});
