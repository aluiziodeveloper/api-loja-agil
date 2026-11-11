import type { UseCase } from '../../../shared/application/use-case.js';
import { type CustomerOrderRef, loadCustomerOrder } from '../load-order.js';
import { toOrderOutput, type OrderOutput } from '../order-output.js';
import type { OrderRepository } from '../ports/order.repository.js';

export type GetOrderInput = CustomerOrderRef;

export class GetOrderUseCase implements UseCase<GetOrderInput, OrderOutput> {
  constructor(private readonly orders: OrderRepository) {}

  async execute(input: GetOrderInput): Promise<OrderOutput> {
    return toOrderOutput(await loadCustomerOrder(this.orders, input));
  }
}
