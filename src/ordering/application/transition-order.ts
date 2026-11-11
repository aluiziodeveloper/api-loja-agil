import type { EventPublisher } from '../../shared/application/events/event-publisher.js';
import type { Transaction } from '../../shared/application/transaction.js';
import type { Order } from '../domain/order.entity.js';
import { loadOrder } from './load-order.js';
import { toOrderOutput, type OrderOutput } from './order-output.js';
import type { OrderRepository } from './ports/order.repository.js';

/** O que uma transição do pedido precisa: gravar, publicar e fazer os dois juntos. */
export type OrderLifecycleDeps = {
  orders: OrderRepository;
  events: EventPublisher;
  transaction: Transaction;
};

/**
 * Carrega, muda o estado, grava e publica os eventos, numa transação só: se um
 * handler falhar, o pedido não fica gravado no estado novo (RN12).
 */
export async function transitionOrder(
  deps: OrderLifecycleDeps,
  orderId: string,
  transition: (order: Order) => void,
): Promise<OrderOutput> {
  return deps.transaction.run(async () => {
    const order = await loadOrder(deps.orders, orderId);
    transition(order);
    await deps.orders.save(order);
    await deps.events.publish(order.pullDomainEvents());
    return toOrderOutput(order);
  });
}
