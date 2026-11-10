import { DomainError } from '../../shared/domain/domain-error.js';

export class ReservedStockExceededError extends DomainError {
  readonly code = 'RESERVED_STOCK_EXCEEDED';

  constructor(requested: number, reserved: number) {
    super(`A quantidade (${requested}) é maior que a reservada (${reserved}).`);
  }
}
