import { DomainEvent } from '../../../shared/domain/domain-event.js';
import type { OrderStatus } from '../order-status.js';
import {
  itemQuantities,
  type ItemQuantity,
  type OrderSnapshot,
} from '../order.snapshot.js';

/**
 * O pedido foi cancelado. Recebe o pedido como estava antes do cancelamento:
 * o estado anterior diz ao Estoque o que desfazer (RN13).
 */
export class OrderCancelled extends DomainEvent {
  readonly eventName = 'OrderCancelled';
  readonly previousStatus: OrderStatus;
  readonly items: ItemQuantity[];

  constructor(orderBeforeCancel: OrderSnapshot) {
    super(orderBeforeCancel.id);
    this.previousStatus = orderBeforeCancel.status;
    this.items = itemQuantities(orderBeforeCancel);
  }
}
