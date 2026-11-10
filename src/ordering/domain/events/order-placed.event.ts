import { DomainEvent } from '../../../shared/domain/domain-event.js';
import type { Money } from '../../../shared/domain/money.value-object.js';
import {
  itemQuantities,
  type ItemQuantity,
  type OrderSnapshot,
} from '../order.snapshot.js';

/** O cliente confirmou o pedido: o Estoque precisa reservar os itens (RN12). */
export class OrderPlaced extends DomainEvent {
  readonly eventName = 'OrderPlaced';
  readonly customerId: string;
  readonly items: ItemQuantity[];
  readonly totalInCents: number;

  constructor(order: OrderSnapshot, total: Money) {
    super(order.id);
    this.customerId = order.customerId;
    this.items = itemQuantities(order);
    this.totalInCents = total.toCents();
  }
}
