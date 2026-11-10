import { ValueObject } from '../../shared/domain/value-object.js';
import { InvalidNameError } from './invalid-name.error.js';

const MIN_LENGTH = 2;
const MAX_LENGTH = 100;

export class Name extends ValueObject<{ value: string }> {
  static create(value: string): Name {
    const normalized = value.trim().replace(/\s+/g, ' ');
    if (normalized.length < MIN_LENGTH || normalized.length > MAX_LENGTH) {
      throw new InvalidNameError(MIN_LENGTH, MAX_LENGTH);
    }
    return new Name({ value: normalized });
  }

  toString(): string {
    return this.props.value;
  }
}
