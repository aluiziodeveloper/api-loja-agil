import { ValueObject } from '../../shared/domain/value-object.js';
import { InvalidProductNameError } from './invalid-product-name.error.js';

const MIN_LENGTH = 2;
const MAX_LENGTH = 120;

export class ProductName extends ValueObject<{ value: string }> {
  static create(value: string): ProductName {
    const normalized = value.trim().replace(/\s+/g, ' ');
    if (normalized.length < MIN_LENGTH || normalized.length > MAX_LENGTH) {
      throw new InvalidProductNameError(MIN_LENGTH, MAX_LENGTH);
    }
    return new ProductName({ value: normalized });
  }

  toString(): string {
    return this.props.value;
  }
}
