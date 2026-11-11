import { Body, Controller, Inject, Post } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../../shared/infrastructure/http/zod-validation.pipe.js';
import { CreateCouponUseCase } from '../../application/use-cases/create-coupon.use-case.js';
import { type CouponResponse, presentCoupon } from './order.presenter.js';

/** A união do desconto é formato, e por isso fica no schema; os limites, no domínio. */
export const createCouponBody = z.object({
  code: z.string(),
  discount: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('PERCENTAGE'),
      percent: z.number(),
      capInCents: z.number(),
    }),
    z.object({ type: z.literal('FIXED_AMOUNT'), amountInCents: z.number() }),
  ]),
  minimumOrderInCents: z.number(),
  expiresAt: z.iso.datetime().transform((value) => new Date(value)),
});

type CreateCouponBody = z.infer<typeof createCouponBody>;

@Controller('coupons')
export class CreateCouponController {
  constructor(
    @Inject(CreateCouponUseCase)
    private readonly createCoupon: CreateCouponUseCase,
  ) {}

  @Post()
  async handle(
    @Body(new ZodValidationPipe(createCouponBody)) body: CreateCouponBody,
  ): Promise<CouponResponse> {
    return presentCoupon(await this.createCoupon.execute(body));
  }
}
