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
