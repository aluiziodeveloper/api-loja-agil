import { DomainError } from '../../shared/domain/domain-error.js';

export class InvalidProductNameError extends DomainError {
  readonly code = 'INVALID_PRODUCT_NAME';

  constructor(minLength: number, maxLength: number) {
    super(
      `Nome de produto inválido: deve ter entre ${minLength} e ${maxLength} caracteres.`,
    );
  }
}
