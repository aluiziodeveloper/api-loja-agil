import type { UseCase } from '../../../shared/application/use-case.js';
import { CouponCode } from '../../domain/coupon/coupon-code.value-object.js';
import { CouponNotFoundError } from '../errors/coupon-not-found.error.js';
import { changeOrder } from '../change-order.js';
import type { OrderOutput } from '../order-output.js';
import type { CouponRepository } from '../ports/coupon.repository.js';
import type { OrderRepository } from '../ports/order.repository.js';

export type ApplyCouponInput = {
  orderId: string;
  customerId: string;
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
    const coupon = await this.coupons.findByCode(code);
    if (!coupon) {
      throw new CouponNotFoundError(code.toString());
    }
    return changeOrder(this.orders, input, (order) =>
      order.applyCoupon(coupon),
    );
  }
}
