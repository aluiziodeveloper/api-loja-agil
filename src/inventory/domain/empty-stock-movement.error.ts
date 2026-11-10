import { DomainError } from '../../shared/domain/domain-error.js';

export class EmptyStockMovementError extends DomainError {
  readonly code = 'EMPTY_STOCK_MOVEMENT';

  constructor() {
    super('A quantidade movimentada deve ser maior que zero.');
  }
}
