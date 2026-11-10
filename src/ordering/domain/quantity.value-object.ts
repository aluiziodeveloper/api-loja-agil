import { ValueObject } from '../../shared/domain/value-object.js';
import { InvalidQuantityError } from './invalid-quantity.error.js';

const MIN_UNITS = 1;
const MAX_UNITS = 100;

/** Quantidade de um item de pedido: de 1 a 100 unidades (RN09). */
export class Quantity extends ValueObject<{ units: number }> {
  static of(units: number): Quantity {
    if (!Number.isInteger(units) || units < MIN_UNITS || units > MAX_UNITS) {
      throw new InvalidQuantityError(units);
    }
    return new Quantity({ units });
  }

  add(other: Quantity): Quantity {
    return Quantity.of(this.props.units + other.props.units);
  }

  toNumber(): number {
    return this.props.units;
  }
}
