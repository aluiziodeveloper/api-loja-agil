import { ValueObject } from '../../shared/domain/value-object.js';
import { InvalidStockQuantityError } from './invalid-stock-quantity.error.js';

/** Unidades de um item no depósito: inteiro e nunca negativo (RN07). */
export class StockQuantity extends ValueObject<{ units: number }> {
  static of(units: number): StockQuantity {
    if (!Number.isSafeInteger(units) || units < 0) {
      throw new InvalidStockQuantityError(units);
    }
    return new StockQuantity({ units });
  }

  static zero(): StockQuantity {
    return StockQuantity.of(0);
  }

  add(other: StockQuantity): StockQuantity {
    return StockQuantity.of(this.props.units + other.props.units);
  }

  subtract(other: StockQuantity): StockQuantity {
    return StockQuantity.of(this.props.units - other.props.units);
  }

  isLessThan(other: StockQuantity): boolean {
    return this.props.units < other.props.units;
  }

  isZero(): boolean {
    return this.props.units === 0;
  }

  toNumber(): number {
    return this.props.units;
  }
}
