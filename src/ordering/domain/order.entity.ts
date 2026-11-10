import { AggregateRoot } from '../../shared/domain/aggregate-root.js';
import type { Money } from '../../shared/domain/money.value-object.js';
import type { Sku } from '../../shared/domain/sku.value-object.js';
import { UniqueId } from '../../shared/domain/unique-id.value-object.js';
import { EmptyOrderError } from './empty-order.error.js';
import { OrderCancelled } from './events/order-cancelled.event.js';
import { OrderPaid } from './events/order-paid.event.js';
import { OrderPlaced } from './events/order-placed.event.js';
import { OrderShipped } from './events/order-shipped.event.js';
import { OrderNotEditableError } from './order-not-editable.error.js';
import type { OrderItem } from './order-item.value-object.js';
import { OrderItems } from './order-items.js';
import type { OrderSnapshot } from './order.snapshot.js';
import { ensureTransition } from './order-lifecycle.js';
import { OrderStatus } from './order-status.js';

type OrderProps = {
  customerId: UniqueId;
  status: OrderStatus;
  items: OrderItems;
  createdAt: Date;
};

export class Order extends AggregateRoot {
  private constructor(
    id: UniqueId,
    private props: OrderProps,
  ) {
    super(id);
  }

  static draft(customerId: UniqueId): Order {
    return new Order(UniqueId.create(), {
      customerId,
      status: OrderStatus.DRAFT,
      items: OrderItems.empty(),
      createdAt: new Date(),
    });
  }

  static restore(snapshot: OrderSnapshot): Order {
    return new Order(UniqueId.from(snapshot.id), {
      customerId: UniqueId.from(snapshot.customerId),
      status: snapshot.status,
      items: OrderItems.restore(snapshot.items),
      createdAt: snapshot.createdAt,
    });
  }

  addItem(item: OrderItem): void {
    this.changeItems(this.editableItems().add(item));
  }

  removeItem(sku: Sku): void {
    this.changeItems(this.editableItems().remove(sku));
  }

  place(): void {
    if (this.props.items.isEmpty()) {
      throw new EmptyOrderError();
    }
    this.moveTo(OrderStatus.PLACED);
    this.record(new OrderPlaced(this.toSnapshot(), this.subtotal()));
  }

  pay(): void {
    this.moveTo(OrderStatus.PAID);
    this.record(new OrderPaid(this.toSnapshot()));
  }

  ship(): void {
    this.moveTo(OrderStatus.SHIPPED);
    this.record(new OrderShipped(this.toSnapshot()));
  }

  cancel(): void {
    const beforeCancel = this.toSnapshot();
    this.moveTo(OrderStatus.CANCELLED);
    this.record(new OrderCancelled(beforeCancel));
  }

  subtotal(): Money {
    return this.props.items.subtotal();
  }

  toSnapshot(): OrderSnapshot {
    return {
      id: this.id.toString(),
      customerId: this.props.customerId.toString(),
      status: this.props.status,
      items: this.props.items.toSnapshot(),
      createdAt: this.props.createdAt,
    };
  }

  /** Itens só mudam no rascunho: depois de confirmado, o pedido é um compromisso. */
  private editableItems(): OrderItems {
    if (this.props.status !== OrderStatus.DRAFT) {
      throw new OrderNotEditableError(this.props.status);
    }
    return this.props.items;
  }

  private moveTo(next: OrderStatus): void {
    ensureTransition(this.props.status, next);
    this.props = { ...this.props, status: next };
  }

  private changeItems(items: OrderItems): void {
    this.props = { ...this.props, items };
  }
}
