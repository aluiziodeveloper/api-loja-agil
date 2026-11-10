import { Money } from '../../../shared/domain/money.value-object.js';
import { PercentageDiscount } from './percentage-discount.js';

function cents(value: number): Money {
  return Money.fromCents(value);
}

describe('PercentageDiscount', () => {
  const tenPercentUpTo20Reais = PercentageDiscount.of(10, cents(2000));

  it('should take the percentage of the subtotal (RN14)', () => {
    expect(tenPercentUpTo20Reais.discountFor(cents(15_000))).toEqual(
      cents(1500),
    );
  });

  it('should never discount more than the cap (RN14)', () => {
    expect(tenPercentUpTo20Reais.discountFor(cents(50_000))).toEqual(
      cents(2000),
    );
  });

  it.each([0, 101, 12.5])('should reject %d percent', (percent) => {
    expect(() => PercentageDiscount.of(percent, cents(2000))).toThrow(
      expect.objectContaining({
        code: 'INVALID_DISCOUNT',
        message: `Desconto inválido: o percentual deve ser um inteiro de 1 a 100, e não ${percent}.`,
      }),
    );
  });
});
