import { DomainEvent } from '../../../shared/domain/domain-event.js';
import type { OrderSnapshot } from '../order.snapshot.js';

export class OrderShipped extends DomainEvent {
  readonly eventName = 'OrderShipped';

  constructor(order: OrderSnapshot) {
    super(order.id);
  }
}
