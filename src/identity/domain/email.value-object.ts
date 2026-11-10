import { ValueObject } from '../../shared/domain/value-object.js';
import { InvalidEmailError } from './invalid-email.error.js';

const MAX_LENGTH = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email extends ValueObject<{ value: string }> {
  static create(value: string): Email {
    const normalized = value.trim().toLowerCase();
    if (normalized.length > MAX_LENGTH || !EMAIL_PATTERN.test(normalized)) {
      throw new InvalidEmailError(value);
    }
    return new Email({ value: normalized });
  }

  toString(): string {
    return this.props.value;
  }
}
