import type { UseCase } from '../../../shared/application/use-case.js';
import type { OrderOutput } from '../order-output.js';
import {
  transitionOrder,
  type OrderLifecycleDeps,
} from '../transition-order.js';

export type ShipOrderInput = {
  orderId: string;
};

export class ShipOrderUseCase implements UseCase<ShipOrderInput, OrderOutput> {
  constructor(private readonly deps: OrderLifecycleDeps) {}

  async execute(input: ShipOrderInput): Promise<OrderOutput> {
    return transitionOrder(this.deps, input.orderId, (order) => order.ship());
  }
}
