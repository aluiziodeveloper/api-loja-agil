import { DomainError } from '../../shared/domain/domain-error.js';

export class InsufficientStockError extends DomainError {
  readonly code = 'INSUFFICIENT_STOCK';

  constructor(requested: number, available: number) {
    super(
      `Estoque insuficiente: solicitado ${requested}, disponível ${available}.`,
    );
  }
}
