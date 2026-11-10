import { UniqueId } from '../../shared/domain/unique-id.value-object.js';
import type { Order } from '../domain/order.entity.js';
import { OrderNotFoundError } from './errors/order-not-found.error.js';
import type { OrderRepository } from './ports/order.repository.js';

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
