import { InvalidQuantityError } from './invalid-quantity.error.js';
import type { Money } from './money.js';
import { ValueObject } from '../../src/shared/domain/value-object.js';

const BULK_THRESHOLD = 10;

export class Quantity extends ValueObject<{ units: number }> {
  static of(units: number): Quantity {
    if (units <= 0) {
      throw new InvalidQuantityError(units);
    }
    return new Quantity({ units });
  }

  isBulk(): boolean {
    return this.props.units >= BULK_THRESHOLD;
  }

  times(unitPrice: Money): Money {
    return unitPrice.multiply(this.props.units);
  }
}
