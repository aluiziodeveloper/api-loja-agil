import { DomainEvent } from '../../../shared/domain/domain-event.js';
import {
  itemQuantities,
  type ItemQuantity,
  type OrderSnapshot,
} from '../order.snapshot.js';

/** O pedido foi pago: as reservas viram baixa no Estoque (RN13). */
export class OrderPaid extends DomainEvent {
  readonly eventName = 'OrderPaid';
  readonly items: ItemQuantity[];

  constructor(order: OrderSnapshot) {
    super(order.id);
    this.items = itemQuantities(order);
  }
}
