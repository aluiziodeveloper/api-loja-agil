import type { Order } from '../domain/order.entity.js';
import { loadOrder } from './load-order.js';
import { toOrderOutput, type OrderOutput } from './order-output.js';
import type { OrderRepository } from './ports/order.repository.js';

/** O roteiro dos comandos de pedido: carregar, mudar, salvar e responder. */
export async function changeOrder(
  orders: OrderRepository,
  orderId: string,
  change: (order: Order) => void,
): Promise<OrderOutput> {
  const order = await loadOrder(orders, orderId);
  change(order);
  await orders.save(order);
  return toOrderOutput(order);
}
