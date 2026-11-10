import { randomUUIDv7 } from 'node:crypto';
import { InvalidIdError } from './invalid-id.error.js';
import { ValueObject } from './value-object.js';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export class UniqueId extends ValueObject<{ value: string }> {
  static create(): UniqueId {
    return new UniqueId({ value: randomUUIDv7() });
  }

  static from(value: string): UniqueId {
    const normalized = value.toLowerCase();
    if (!UUID_PATTERN.test(normalized)) {
      throw new InvalidIdError(value);
    }
    return new UniqueId({ value: normalized });
  }

  toString(): string {
    return this.props.value;
  }
}
