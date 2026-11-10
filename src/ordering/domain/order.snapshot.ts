import type { OrderItemSnapshot } from './order-item.value-object.js';
import type { OrderStatus } from './order-status.js';

/** Estado de um pedido em primitivos: o contrato com a borda. */
export type OrderSnapshot = {
  id: string;
  customerId: string;
  status: OrderStatus;
  items: OrderItemSnapshot[];
  createdAt: Date;
};

/** O que o Estoque precisa saber de um item: SKU e quantidade, sem preço. */
export type ItemQuantity = {
  sku: string;
  quantity: number;
};

export function itemQuantities(order: OrderSnapshot): ItemQuantity[] {
  return order.items.map(({ sku, quantity }) => ({ sku, quantity }));
}
