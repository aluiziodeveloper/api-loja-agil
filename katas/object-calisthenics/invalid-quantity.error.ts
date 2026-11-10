import { DomainError } from '../../src/shared/domain/domain-error.js';

export class InvalidQuantityError extends DomainError {
  readonly code = 'INVALID_QUANTITY';

  constructor(units: number) {
    super(`Quantidade inválida: ${units}.`);
  }
}
