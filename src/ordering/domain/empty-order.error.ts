import { DomainError } from '../../shared/domain/domain-error.js';

export class EmptyOrderError extends DomainError {
  readonly code = 'EMPTY_ORDER';

  constructor() {
    super('Adicione ao menos um item antes de confirmar o pedido.');
  }
}
