import { ValueObject } from '../../src/shared/domain/value-object.js';

export class Money extends ValueObject<{ cents: number }> {
  static ofCents(cents: number): Money {
    return new Money({ cents });
  }

  static zero(): Money {
    return Money.ofCents(0);
  }

  add(other: Money): Money {
    return Money.ofCents(this.props.cents + other.props.cents);
  }

  multiply(factor: number): Money {
    return Money.ofCents(this.props.cents * factor);
  }

  percentOff(percent: number): Money {
    return Money.ofCents(
      Math.round((this.props.cents * (100 - percent)) / 100),
    );
  }

  isAtLeast(other: Money): boolean {
    return this.props.cents >= other.props.cents;
  }

  toCents(): number {
    return this.props.cents;
  }
}
