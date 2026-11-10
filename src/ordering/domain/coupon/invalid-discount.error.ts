import { DomainError } from '../../../shared/domain/domain-error.js';

export class InvalidDiscountError extends DomainError {
  readonly code = 'INVALID_DISCOUNT';

  constructor(reason: string) {
    super(`Desconto inválido: ${reason}.`);
  }
}
