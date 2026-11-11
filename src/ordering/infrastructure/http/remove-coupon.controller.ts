import {
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Delete,
} from '@nestjs/common';
import { RemoveCouponUseCase } from '../../application/use-cases/remove-coupon.use-case.js';
import { type OrderResponse, presentOrder } from './order.presenter.js';

/** Tira o cupom de um rascunho. */
@Controller('orders')
export class RemoveCouponController {
  constructor(
    @Inject(RemoveCouponUseCase)
    private readonly removeCoupon: RemoveCouponUseCase,
  ) {}

  @Delete(':id/coupon')
  @HttpCode(HttpStatus.OK)
  async handle(@Param('id') id: string): Promise<OrderResponse> {
    return presentOrder(await this.removeCoupon.execute({ orderId: id }));
  }
}
