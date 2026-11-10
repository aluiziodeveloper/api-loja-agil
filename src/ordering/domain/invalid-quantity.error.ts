import { DomainError } from '../../shared/domain/domain-error.js';

export class InvalidQuantityError extends DomainError {
  readonly code = 'INVALID_QUANTITY';

  constructor(units: number) {
    super(`Quantidade inválida: ${units}. Use um número inteiro de 1 a 100.`);
  }
}
