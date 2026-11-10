import { DomainError } from '../../../shared/domain/domain-error.js';

export class OrderNotFoundError extends DomainError {
  readonly code = 'ORDER_NOT_FOUND';

  constructor(id: string) {
    super(`Pedido "${id}" não encontrado.`);
  }
}
