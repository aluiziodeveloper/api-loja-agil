import type { UseCase } from '../../../shared/application/use-case.js';
import { Sku } from '../../../shared/domain/sku.value-object.js';
import { changeOrder } from '../change-order.js';
import type { OrderOutput } from '../order-output.js';
import type { OrderRepository } from '../ports/order.repository.js';

export type RemoveOrderItemInput = {
  orderId: string;
  sku: string;
};

export class RemoveOrderItemUseCase implements UseCase<
  RemoveOrderItemInput,
  OrderOutput
> {
  constructor(private readonly orders: OrderRepository) {}

  async execute(input: RemoveOrderItemInput): Promise<OrderOutput> {
    const sku = Sku.create(input.sku);
    return changeOrder(this.orders, input.orderId, (order) =>
      order.removeItem(sku),
    );
  }
}
