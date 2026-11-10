import { ValueObject } from './value-object.js';
import { InvalidSkuError } from './invalid-sku.error.js';

/** Código base de 3 a 12 letras ou dígitos, com variação opcional: ABC123-AZUL. */
const SKU_PATTERN = /^[A-Z0-9]{3,12}(-[A-Z0-9]{1,6})?$/;

export class Sku extends ValueObject<{ value: string }> {
  static create(value: string): Sku {
    const normalized = value.trim().toUpperCase();
    if (!SKU_PATTERN.test(normalized)) {
      throw new InvalidSkuError(value);
    }
    return new Sku({ value: normalized });
  }

  toString(): string {
    return this.props.value;
  }
}
