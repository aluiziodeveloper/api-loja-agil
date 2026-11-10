import { Money } from '../../shared/domain/money.value-object.js';
import type { Sku } from '../../shared/domain/sku.value-object.js';
import { OrderItemNotFoundError } from './order-item-not-found.error.js';
import {
  OrderItem,
  type OrderItemSnapshot,
} from './order-item.value-object.js';
import { TooManyOrderItemsError } from './too-many-order-items.error.js';

const MAX_DISTINCT_ITEMS = 20;

/** Coleção de primeira classe: as regras da lista de itens moram aqui (RN09). */
export class OrderItems {
  private constructor(private readonly items: readonly OrderItem[]) {}

  static empty(): OrderItems {
    return new OrderItems([]);
  }

  static restore(snapshots: OrderItemSnapshot[]): OrderItems {
    return new OrderItems(
      snapshots.map((snapshot) => OrderItem.restore(snapshot)),
    );
  }

  add(item: OrderItem): OrderItems {
    const sameSku = this.items.find((current) => current.isFor(item.sku()));
    if (sameSku) {
      return this.replace(sameSku, sameSku.merge(item));
    }
    if (this.items.length === MAX_DISTINCT_ITEMS) {
      throw new TooManyOrderItemsError(MAX_DISTINCT_ITEMS);
    }
    return new OrderItems([...this.items, item]);
  }

  remove(sku: Sku): OrderItems {
    const remaining = this.items.filter((item) => !item.isFor(sku));
    if (remaining.length === this.items.length) {
      throw new OrderItemNotFoundError(sku.toString());
    }
    return new OrderItems(remaining);
  }

  subtotal(): Money {
    return this.items.reduce(
      (sum, item) => sum.add(item.subtotal()),
      Money.zero(),
    );
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  toSnapshot(): OrderItemSnapshot[] {
    return this.items.map((item) => item.toSnapshot());
  }

  private replace(current: OrderItem, next: OrderItem): OrderItems {
    return new OrderItems(
      this.items.map((item) => (item === current ? next : item)),
    );
  }
}
