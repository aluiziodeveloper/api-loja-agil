import type { Order } from '../domain/order.entity.js';
import { type CustomerOrderRef, loadCustomerOrder } from './load-order.js';
import { toOrderOutput, type OrderOutput } from './order-output.js';
import type { OrderRepository } from './ports/order.repository.js';

/** O roteiro dos comandos do cliente: carregar o pedido dele, mudar, salvar e responder. */
export async function changeOrder(
  orders: OrderRepository,
  ref: CustomerOrderRef,
  change: (order: Order) => void,
): Promise<OrderOutput> {
  const order = await loadCustomerOrder(orders, ref);
  change(order);
  await orders.save(order);
  return toOrderOutput(order);
}
