import { Body, Controller, Inject, Post, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiBodyOf,
  ApiData,
  ApiErrors,
} from '../../../shared/infrastructure/openapi/api-docs.decorators.js';
import { z } from 'zod';
import { ZodValidationPipe } from '../../../shared/infrastructure/http/zod-validation.pipe.js';
import { CreateCouponUseCase } from '../../application/use-cases/create-coupon.use-case.js';
import {
  couponResponse,
  type CouponResponse,
  presentCoupon,
} from './order.presenter.js';
import { OPERATOR } from '../../../shared/infrastructure/auth/roles.js';
import { Roles } from '../../../shared/infrastructure/auth/roles.decorator.js';

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

@ApiTags('Pedidos')
@Controller('coupons')
export class CreateCouponController {
  constructor(
    @Inject(CreateCouponUseCase)
    private readonly createCoupon: CreateCouponUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria um cupom de desconto.' })
  @ApiErrors(
    'INVALID_COUPON_CODE',
    'INVALID_DISCOUNT',
    'INVALID_MONEY',
    'COUPON_CODE_IN_USE',
  )
  @ApiBodyOf(createCouponBody)
  @ApiData(couponResponse, HttpStatus.CREATED)
  @Roles(OPERATOR)
  async handle(
    @Body(new ZodValidationPipe(createCouponBody)) body: CreateCouponBody,
  ): Promise<CouponResponse> {
    return presentCoupon(await this.createCoupon.execute(body));
  }
}
