import { DomainError } from '../../shared/domain/domain-error.js';

export class InvalidStockQuantityError extends DomainError {
  readonly code = 'INVALID_STOCK_QUANTITY';

  constructor(units: number) {
    super(
      `Quantidade de estoque inválida: ${units}. Use um número inteiro não negativo.`,
    );
  }
}
