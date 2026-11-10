import { InvalidMoneyError } from './invalid-money.error.js';
import { Money } from './money.value-object.js';

describe('Money', () => {
  it('should hold an amount in cents', () => {
    expect(Money.fromCents(4990).toCents()).toBe(4990);
  });

  it('should accept zero', () => {
    expect(Money.zero().toCents()).toBe(0);
  });

  it.each([
    ['a negative amount', -1],
    ['a fraction of a cent', 10.5],
    ['NaN', Number.NaN],
    ['infinity', Number.POSITIVE_INFINITY],
    ['an amount beyond the safe integer range', Number.MAX_SAFE_INTEGER + 1],
  ])('should reject %s', (_case, cents) => {
    expect(() => Money.fromCents(cents)).toThrow(
      expect.objectContaining({ code: 'INVALID_MONEY' }),
    );
  });

  it('should explain the rule in the error message', () => {
    expect(() => Money.fromCents(-1)).toThrow(
      'Valor monetário inválido: -1. Use centavos inteiros e não negativos.',
    );
  });

  it('should add amounts without floating point errors', () => {
    const total = Money.fromCents(10).add(Money.fromCents(20));

    expect(total.toCents()).toBe(30);
    expect(0.1 + 0.2).not.toBe(0.3);
  });

  it('should multiply by a quantity', () => {
    expect(Money.fromCents(4990).multiply(3).toCents()).toBe(14970);
  });

  it.each([
    ['is negative', -1],
    ['is not a whole number of cents', 1.5],
  ])('should reject a product that %s', (_case, factor) => {
    expect(() => Money.fromCents(4991).multiply(factor)).toThrow(
      InvalidMoneyError,
    );
  });

  it('should compare amounts', () => {
    const cheap = Money.fromCents(1000);
    const expensive = Money.fromCents(5000);

    expect(expensive.isGreaterThan(cheap)).toBe(true);
    expect(cheap.isGreaterThan(expensive)).toBe(false);
    expect(cheap.isGreaterThan(Money.fromCents(1000))).toBe(false);
  });

  it('should be equal to another amount with the same cents', () => {
    expect(Money.fromCents(4990).equals(Money.fromCents(4990))).toBe(true);
    expect(Money.fromCents(4990).equals(Money.fromCents(4991))).toBe(false);
  });

  it('should never change the original amount', () => {
    const price = Money.fromCents(4990);

    price.add(Money.fromCents(10));
    price.multiply(2);

    expect(price.toCents()).toBe(4990);
  });
});
