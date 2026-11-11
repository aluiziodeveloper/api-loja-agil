import { Body, Controller, Inject, Param, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiBodyOf,
  ApiData,
  ApiErrors,
} from '../../../shared/infrastructure/openapi/api-docs.decorators.js';
import { z } from 'zod';
import { ZodValidationPipe } from '../../../shared/infrastructure/http/zod-validation.pipe.js';
import { ApplyCouponUseCase } from '../../application/use-cases/apply-coupon.use-case.js';
import {
  orderResponse,
  type OrderResponse,
  presentOrder,
} from './order.presenter.js';
import { CurrentCustomer } from './current-customer.decorator.js';

export const applyCouponBody = z.object({ code: z.string() });

type ApplyCouponBody = z.infer<typeof applyCouponBody>;

/** Um pedido tem no máximo um cupom: ele é um sub-recurso único, por isso PUT. */
@ApiTags('Pedidos')
@Controller('orders')
export class ApplyCouponController {
  constructor(
    @Inject(ApplyCouponUseCase)
    private readonly applyCoupon: ApplyCouponUseCase,
  ) {}

  @Put(':id/coupon')
  @ApiOperation({ summary: 'Aplica um cupom ao rascunho do pedido.' })
  @ApiErrors(
    'INVALID_ID',
    'ORDER_NOT_FOUND',
    'ORDER_NOT_EDITABLE',
    'INVALID_COUPON_CODE',
    'COUPON_NOT_FOUND',
    'COUPON_NOT_APPLICABLE',
    'COUPON_ALREADY_APPLIED',
  )
  @ApiBodyOf(applyCouponBody)
  @ApiData(orderResponse)
  async handle(
    @CurrentCustomer() customerId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(applyCouponBody)) body: ApplyCouponBody,
  ): Promise<OrderResponse> {
    const output = await this.applyCoupon.execute({
      orderId: id,
      customerId,
      ...body,
    });
    return presentOrder(output);
  }
}
