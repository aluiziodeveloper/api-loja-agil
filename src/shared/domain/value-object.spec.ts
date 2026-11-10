import { ValueObject } from './value-object.js';

type AmountProps = { amount: number; currency: string };

class Amount extends ValueObject<AmountProps> {
  static of(amount: number, currency: string): Amount {
    return new Amount({ amount, currency });
  }

  forceAmount(amount: number): void {
    (this.props as AmountProps).amount = amount;
  }
}

class OtherAmount extends ValueObject<AmountProps> {
  static of(amount: number, currency: string): OtherAmount {
    return new OtherAmount({ amount, currency });
  }
}

describe('ValueObject', () => {
  it('should be equal to another instance with the same values', () => {
    const first = Amount.of(10, 'BRL');
    const second = Amount.of(10, 'BRL');

    expect(first.equals(second)).toBe(true);
  });

  it('should not be equal when any value differs', () => {
    const amount = Amount.of(10, 'BRL');

    expect(amount.equals(Amount.of(11, 'BRL'))).toBe(false);
    expect(amount.equals(Amount.of(10, 'USD'))).toBe(false);
  });

  it('should not be equal to a different value object type', () => {
    const amount = Amount.of(10, 'BRL');
    const other = OtherAmount.of(10, 'BRL');

    expect(amount.equals(other)).toBe(false);
  });

  it('should not be equal to undefined', () => {
    const amount = Amount.of(10, 'BRL');

    expect(amount.equals(undefined)).toBe(false);
  });

  it('should be immutable', () => {
    const amount = Amount.of(10, 'BRL');

    expect(() => amount.forceAmount(99)).toThrow(TypeError);
    expect(amount.equals(Amount.of(10, 'BRL'))).toBe(true);
  });
});
