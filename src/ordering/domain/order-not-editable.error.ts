import { DomainError } from '../../shared/domain/domain-error.js';
import type { OrderStatus } from './order-status.js';

export class OrderNotEditableError extends DomainError {
  readonly code = 'ORDER_NOT_EDITABLE';

  constructor(status: OrderStatus) {
    super(`Só é possível alterar pedidos em rascunho; este está ${status}.`);
  }
}
