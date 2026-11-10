import { ValueObject } from '../../shared/domain/value-object.js';
import { InvalidPasswordHashError } from './invalid-password-hash.error.js';

export class PasswordHash extends ValueObject<{ value: string }> {
  static fromHash(value: string): PasswordHash {
    if (value.trim().length === 0) {
      throw new InvalidPasswordHashError();
    }
    return new PasswordHash({ value });
  }

  toString(): string {
    return this.props.value;
  }
}
