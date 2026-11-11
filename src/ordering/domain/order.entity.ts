import { AggregateRoot } from '../../shared/domain/aggregate-root.js';
import type { Sku } from '../../shared/domain/sku.value-object.js';
import { UniqueId } from '../../shared/domain/unique-id.value-object.js';
import { Basket, type OrderPrices } from './basket.js';
import type { Coupon } from './coupon/coupon.entity.js';
import { OrderCancelled } from './events/order-cancelled.event.js';
import { OrderPaid } from './events/order-paid.event.js';
import { OrderPlaced } from './events/order-placed.event.js';
import { OrderShipped } from './events/order-shipped.event.js';
import { OrderNotEditableError } from './order-not-editable.error.js';
import type { OrderItem } from './order-item.value-object.js';
import { ensureTransition } from './order-lifecycle.js';
import type { OrderSnapshot } from './order.snapshot.js';
import { OrderStatus } from './order-status.js';

type OrderProps = {
  customerId: UniqueId;
  status: OrderStatus;
  basket: Basket;
  createdAt: Date;
};

/** O pedido cuida do ciclo de vida; a cesta, do que se compra e por quanto. */
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
      basket: Basket.empty(),
      createdAt: new Date(),
    });
  }

  static restore(snapshot: OrderSnapshot): Order {
    return new Order(UniqueId.from(snapshot.id), {
      customerId: UniqueId.from(snapshot.customerId),
      status: snapshot.status,
      basket: Basket.restore(snapshot),
      createdAt: snapshot.createdAt,
    });
  }

  addItem(item: OrderItem): void {
    this.changeBasket((basket) => basket.add(item));
  }

  removeItem(sku: Sku): void {
    this.changeBasket((basket) => basket.remove(sku));
  }

  applyCoupon(coupon: Coupon): void {
    this.changeBasket((basket) => basket.withCoupon(coupon, new Date()));
  }

  removeCoupon(): void {
    this.changeBasket((basket) => basket.withoutCoupon());
  }

  place(): void {
    this.props.basket.ensureReadyToPlace(new Date());
    this.moveTo(OrderStatus.PLACED);
    this.record(new OrderPlaced(this.toSnapshot(), this.prices().total));
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

  /** RN15: o pedido é do cliente que o criou. */
  belongsTo(customerId: UniqueId): boolean {
    return this.props.customerId.equals(customerId);
  }

  prices(): OrderPrices {
    return this.props.basket.prices(new Date());
  }

  toSnapshot(): OrderSnapshot {
    return {
      id: this.id.toString(),
      customerId: this.props.customerId.toString(),
      status: this.props.status,
      ...this.props.basket.toSnapshot(),
      createdAt: this.props.createdAt,
    };
  }

  private moveTo(next: OrderStatus): void {
    ensureTransition(this.props.status, next);
    this.props = { ...this.props, status: next };
  }

  /** A cesta só muda no rascunho: depois de confirmado, o pedido é um compromisso. */
  private changeBasket(change: (basket: Basket) => Basket): void {
    if (this.props.status !== OrderStatus.DRAFT) {
      throw new OrderNotEditableError(this.props.status);
    }
    this.props = { ...this.props, basket: change(this.props.basket) };
  }
}
