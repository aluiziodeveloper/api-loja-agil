import type { UseCase } from '../../../shared/application/use-case.js';
import { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import { Order } from '../../domain/order.entity.js';
import { toOrderOutput, type OrderOutput } from '../order-output.js';
import type { OrderRepository } from '../ports/order.repository.js';

export type CreateDraftOrderInput = {
  customerId: string;
};

export class CreateDraftOrderUseCase implements UseCase<
  CreateDraftOrderInput,
  OrderOutput
> {
  constructor(private readonly orders: OrderRepository) {}

  async execute(input: CreateDraftOrderInput): Promise<OrderOutput> {
    const order = Order.draft(UniqueId.from(input.customerId));
    await this.orders.save(order);
    return toOrderOutput(order);
  }
}
