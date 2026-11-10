import { DomainError } from '../../shared/domain/domain-error.js';

export class StockBelowReservedError extends DomainError {
  readonly code = 'STOCK_BELOW_RESERVED';

  constructor(onHand: number, reserved: number) {
    super(
      `O estoque físico (${onHand}) não pode ficar abaixo do reservado (${reserved}).`,
    );
  }
}
