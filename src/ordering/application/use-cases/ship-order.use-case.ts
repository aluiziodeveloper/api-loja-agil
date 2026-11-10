import type { UseCase } from '../../../shared/application/use-case.js';
import { changeOrder } from '../change-order.js';
import type { OrderOutput } from '../order-output.js';
import type { OrderRepository } from '../ports/order.repository.js';

export type ShipOrderInput = {
  orderId: string;
};

export class ShipOrderUseCase implements UseCase<ShipOrderInput, OrderOutput> {
  constructor(private readonly orders: OrderRepository) {}

  async execute(input: ShipOrderInput): Promise<OrderOutput> {
    return changeOrder(this.orders, input.orderId, (order) => order.ship());
  }
}
