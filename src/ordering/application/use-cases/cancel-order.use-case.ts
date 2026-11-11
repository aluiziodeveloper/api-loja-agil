import type { UseCase } from '../../../shared/application/use-case.js';
import type { OrderOutput } from '../order-output.js';
import {
  transitionOrder,
  type OrderLifecycleDeps,
} from '../transition-order.js';

export type CancelOrderInput = {
  orderId: string;
};

export class CancelOrderUseCase implements UseCase<
  CancelOrderInput,
  OrderOutput
> {
  constructor(private readonly deps: OrderLifecycleDeps) {}

  async execute(input: CancelOrderInput): Promise<OrderOutput> {
    return transitionOrder(this.deps, input.orderId, (order) => order.cancel());
  }
}
