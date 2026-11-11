import type { UseCase } from '../../../shared/application/use-case.js';
import { type CustomerOrderRef, loadCustomerOrder } from '../load-order.js';
import type { OrderOutput } from '../order-output.js';
import {
  transitionOrder,
  type OrderLifecycleDeps,
} from '../transition-order.js';

export type CancelOrderInput = CustomerOrderRef;

export class CancelOrderUseCase implements UseCase<
  CancelOrderInput,
  OrderOutput
> {
  constructor(private readonly deps: OrderLifecycleDeps) {}

  async execute(input: CancelOrderInput): Promise<OrderOutput> {
    return transitionOrder(
      this.deps,
      (orders) => loadCustomerOrder(orders, input),
      (order) => order.cancel(),
    );
  }
}
