import { DomainError } from '../../shared/domain/domain-error.js';
import type { OrderStatus } from './order-status.js';

export class InvalidOrderTransitionError extends DomainError {
  readonly code = 'INVALID_ORDER_TRANSITION';

  constructor(from: OrderStatus, to: OrderStatus) {
    super(`Um pedido ${from} não pode passar para ${to}.`);
  }
}
