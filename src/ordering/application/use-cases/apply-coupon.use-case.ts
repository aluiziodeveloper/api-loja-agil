import type { UseCase } from '../../../shared/application/use-case.js';
import { CouponCode } from '../../domain/coupon/coupon-code.value-object.js';
import { CouponNotFoundError } from '../errors/coupon-not-found.error.js';
import { loadOrder } from '../load-order.js';
import { toOrderOutput, type OrderOutput } from '../order-output.js';
import type { CouponRepository } from '../ports/coupon.repository.js';
import type { OrderRepository } from '../ports/order.repository.js';

export type ApplyCouponInput = {
  orderId: string;
  code: string;
};

export class ApplyCouponUseCase implements UseCase<
  ApplyCouponInput,
  OrderOutput
> {
  constructor(
    private readonly orders: OrderRepository,
    private readonly coupons: CouponRepository,
  ) {}

  async execute(input: ApplyCouponInput): Promise<OrderOutput> {
    const code = CouponCode.create(input.code);
    const order = await loadOrder(this.orders, input.orderId);
    const coupon = await this.coupons.findByCode(code);
    if (!coupon) {
      throw new CouponNotFoundError(code.toString());
    }

    order.applyCoupon(coupon);
    await this.orders.save(order);
    return toOrderOutput(order);
  }
}
