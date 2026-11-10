import { ValueObject } from '../../shared/domain/value-object.js';
import { WeakPasswordError } from './weak-password.error.js';

const MIN_LENGTH = 8;
const MAX_LENGTH = 128;
const HAS_LETTER = /\p{L}/u;
const HAS_DIGIT = /\d/;
const MASK = '********';

export class Password extends ValueObject<{ value: string }> {
  static create(value: string): Password {
    if (!Password.isStrong(value)) {
      throw new WeakPasswordError(MIN_LENGTH, MAX_LENGTH);
    }
    return new Password({ value });
  }

  private static isStrong(value: string): boolean {
    const hasValidLength =
      value.length >= MIN_LENGTH && value.length <= MAX_LENGTH;
    return hasValidLength && HAS_LETTER.test(value) && HAS_DIGIT.test(value);
  }

  reveal(): string {
    return this.props.value;
  }

  toString(): string {
    return MASK;
  }

  toJSON(): string {
    return MASK;
  }
}
