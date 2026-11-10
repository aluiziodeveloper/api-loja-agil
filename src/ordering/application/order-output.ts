import {
  OrderItem,
  type OrderItemSnapshot,
} from '../domain/order-item.value-object.js';
import type { Order } from '../domain/order.entity.js';
import type { OrderStatus } from '../domain/order-status.js';

export type OrderItemOutput = {
  sku: string;
  unitPriceInCents: number;
  quantity: number;
  subtotalInCents: number;
};

export type OrderOutput = {
  id: string;
  customerId: string;
  status: OrderStatus;
  items: OrderItemOutput[];
  couponCode: string | null;
  subtotalInCents: number;
  discountInCents: number;
  totalInCents: number;
  createdAt: string;
};

function toItemOutput(item: OrderItemSnapshot): OrderItemOutput {
  const subtotal = OrderItem.restore(item).subtotal();
  return { ...item, subtotalInCents: subtotal.toCents() };
}

export function toOrderOutput(order: Order): OrderOutput {
  const { items, coupon, createdAt, ...snapshot } = order.toSnapshot();
  const { subtotal, discount, total } = order.prices();
  return {
    ...snapshot,
    items: items.map(toItemOutput),
    couponCode: coupon?.code ?? null,
    subtotalInCents: subtotal.toCents(),
    discountInCents: discount.toCents(),
    totalInCents: total.toCents(),
    createdAt: createdAt.toISOString(),
  };
}
