import type { UseCase } from '../../../shared/application/use-case.js';
import { loadOrder } from '../load-order.js';
import { toOrderOutput, type OrderOutput } from '../order-output.js';
import type { OrderRepository } from '../ports/order.repository.js';

export type RemoveCouponInput = {
  orderId: string;
};

export class RemoveCouponUseCase implements UseCase<
  RemoveCouponInput,
  OrderOutput
> {
  constructor(private readonly orders: OrderRepository) {}

  async execute(input: RemoveCouponInput): Promise<OrderOutput> {
    const order = await loadOrder(this.orders, input.orderId);

    order.removeCoupon();
    await this.orders.save(order);
    return toOrderOutput(order);
  }
}
