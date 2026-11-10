import { AggregateRoot } from '../../shared/domain/aggregate-root.js';
import type { Money } from '../../shared/domain/money.value-object.js';
import type { Sku } from '../../shared/domain/sku.value-object.js';
import { UniqueId } from '../../shared/domain/unique-id.value-object.js';
import { OrderNotEditableError } from './order-not-editable.error.js';
import type { OrderItem } from './order-item.value-object.js';
import { OrderItems } from './order-items.js';
import type { OrderSnapshot } from './order.snapshot.js';
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

  private changeItems(items: OrderItems): void {
    this.props = { ...this.props, items };
  }
}
