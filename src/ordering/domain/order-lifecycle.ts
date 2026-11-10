import { InvalidOrderTransitionError } from './invalid-order-transition.error.js';
import { OrderStatus } from './order-status.js';

const { DRAFT, PLACED, PAID, SHIPPED, CANCELLED } = OrderStatus;

/** A máquina de estados do pedido (RN11): para onde cada estado pode ir. */
const TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  [DRAFT]: [PLACED, CANCELLED],
  [PLACED]: [PAID, CANCELLED],
  [PAID]: [SHIPPED, CANCELLED],
  [SHIPPED]: [],
  [CANCELLED]: [],
};

export function ensureTransition(from: OrderStatus, to: OrderStatus): void {
  if (!TRANSITIONS[from].includes(to)) {
    throw new InvalidOrderTransitionError(from, to);
  }
}
