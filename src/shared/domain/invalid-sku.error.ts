import { DomainError } from './domain-error.js';

export class InvalidSkuError extends DomainError {
  readonly code = 'INVALID_SKU';

  constructor(value: string) {
    super(`SKU inválido: "${value}".`);
  }
}
