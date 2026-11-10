import type { UseCase } from '../../../shared/application/use-case.js';
import { changeOrder } from '../change-order.js';
import type { OrderOutput } from '../order-output.js';
import type { OrderRepository } from '../ports/order.repository.js';

export type CancelOrderInput = {
  orderId: string;
};

export class CancelOrderUseCase implements UseCase<
  CancelOrderInput,
  OrderOutput
> {
  constructor(private readonly orders: OrderRepository) {}

  async execute(input: CancelOrderInput): Promise<OrderOutput> {
    return changeOrder(this.orders, input.orderId, (order) => order.cancel());
  }
}
