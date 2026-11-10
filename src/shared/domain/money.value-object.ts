import { InvalidMoneyError } from './invalid-money.error.js';
import { ValueObject } from './value-object.js';

/** Valor em centavos de real: inteiro, para não sofrer com ponto flutuante. */
export class Money extends ValueObject<{ cents: number }> {
  static fromCents(cents: number): Money {
    if (!Number.isSafeInteger(cents) || cents < 0) {
      throw new InvalidMoneyError(cents);
    }
    return new Money({ cents });
  }

  static zero(): Money {
    return Money.fromCents(0);
  }

  add(other: Money): Money {
    return Money.fromCents(this.props.cents + other.props.cents);
  }

  multiply(factor: number): Money {
    return Money.fromCents(this.props.cents * factor);
  }

  isGreaterThan(other: Money): boolean {
    return this.props.cents > other.props.cents;
  }

  toCents(): number {
    return this.props.cents;
  }
}
