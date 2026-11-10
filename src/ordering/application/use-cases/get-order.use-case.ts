import type { UseCase } from '../../../shared/application/use-case.js';
import { loadOrder } from '../load-order.js';
import { toOrderOutput, type OrderOutput } from '../order-output.js';
import type { OrderRepository } from '../ports/order.repository.js';

export type GetOrderInput = {
  orderId: string;
};

export class GetOrderUseCase implements UseCase<GetOrderInput, OrderOutput> {
  constructor(private readonly orders: OrderRepository) {}

  async execute(input: GetOrderInput): Promise<OrderOutput> {
    return toOrderOutput(await loadOrder(this.orders, input.orderId));
  }
}
