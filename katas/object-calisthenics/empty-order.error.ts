import { DomainError } from '../../src/shared/domain/domain-error.js';

export class EmptyOrderError extends DomainError {
  readonly code = 'EMPTY_ORDER';

  constructor() {
    super('Pedido sem itens.');
  }
}
