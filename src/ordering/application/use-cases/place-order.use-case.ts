import type { UseCase } from '../../../shared/application/use-case.js';
import type { OrderOutput } from '../order-output.js';
import {
  transitionOrder,
  type OrderLifecycleDeps,
} from '../transition-order.js';

export type PlaceOrderInput = {
  orderId: string;
};

export class PlaceOrderUseCase implements UseCase<
  PlaceOrderInput,
  OrderOutput
> {
  constructor(private readonly deps: OrderLifecycleDeps) {}

  async execute(input: PlaceOrderInput): Promise<OrderOutput> {
    return transitionOrder(this.deps, input.orderId, (order) => order.place());
  }
}
