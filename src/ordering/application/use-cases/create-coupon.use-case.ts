import { Money } from '../../../shared/domain/money.value-object.js';
import type { UseCase } from '../../../shared/application/use-case.js';
import { CouponCode } from '../../domain/coupon/coupon-code.value-object.js';
import { Coupon } from '../../domain/coupon/coupon.entity.js';
import type { DiscountSnapshot } from '../../domain/coupon/coupon.snapshot.js';
import { discountPolicyFrom } from '../../domain/coupon/discount-policy.factory.js';
import { toCouponOutput, type CouponOutput } from '../coupon-output.js';
import { CouponCodeInUseError } from '../errors/coupon-code-in-use.error.js';
import type { CouponRepository } from '../ports/coupon.repository.js';

export type CreateCouponInput = {
  code: string;
  discount: DiscountSnapshot;
  minimumOrderInCents: number;
  expiresAt: Date;
};

export class CreateCouponUseCase implements UseCase<
  CreateCouponInput,
  CouponOutput
> {
  constructor(private readonly coupons: CouponRepository) {}

  async execute(input: CreateCouponInput): Promise<CouponOutput> {
    const coupon = Coupon.create({
      code: CouponCode.create(input.code),
      discount: discountPolicyFrom(input.discount),
      minimumOrder: Money.fromCents(input.minimumOrderInCents),
      expiresAt: input.expiresAt,
    });
    if (await this.coupons.findByCode(coupon.code())) {
      throw new CouponCodeInUseError(coupon.code().toString());
    }
    await this.coupons.save(coupon);
    return toCouponOutput(coupon);
  }
}
