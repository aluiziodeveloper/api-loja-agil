import { UniqueId } from '../../shared/domain/unique-id.value-object.js';
import type { Order } from '../domain/order.entity.js';
import { OrderNotFoundError } from './errors/order-not-found.error.js';
import type { OrderRepository } from './ports/order.repository.js';

/** Um pedido visto pelo cliente: qual pedido e quem está pedindo. */
export type CustomerOrderRef = {
  orderId: string;
  customerId: string;
};

/** Qualquer pedido: é como a loja (o operador) enxerga. */
export async function loadOrder(
  orders: OrderRepository,
  orderId: string,
): Promise<Order> {
  const order = await orders.findById(UniqueId.from(orderId));
  if (!order) {
    throw new OrderNotFoundError(orderId);
  }
  return order;
}

/**
 * Só o pedido do próprio cliente (RN15). O pedido de outro responde como se
 * não existisse: 404, e não 403, para não confirmar que aquele id existe.
 */
export async function loadCustomerOrder(
  orders: OrderRepository,
  { orderId, customerId }: CustomerOrderRef,
): Promise<Order> {
  const order = await loadOrder(orders, orderId);
  if (!order.belongsTo(UniqueId.from(customerId))) {
    throw new OrderNotFoundError(orderId);
  }
  return order;
}
