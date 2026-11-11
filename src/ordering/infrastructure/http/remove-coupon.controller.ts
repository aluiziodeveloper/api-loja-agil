import {
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiData } from '../../../shared/infrastructure/openapi/api-docs.decorators.js';
import { RemoveCouponUseCase } from '../../application/use-cases/remove-coupon.use-case.js';
import {
  orderResponse,
  type OrderResponse,
  presentOrder,
} from './order.presenter.js';
import { CurrentCustomer } from './current-customer.decorator.js';

/** Tira o cupom de um rascunho. */
@ApiTags('Pedidos')
@Controller('orders')
export class RemoveCouponController {
  constructor(
    @Inject(RemoveCouponUseCase)
    private readonly removeCoupon: RemoveCouponUseCase,
  ) {}

  @Delete(':id/coupon')
  @ApiData(orderResponse)
  @HttpCode(HttpStatus.OK)
  async handle(
    @CurrentCustomer() customerId: string,
    @Param('id') id: string,
  ): Promise<OrderResponse> {
    return presentOrder(
      await this.removeCoupon.execute({ orderId: id, customerId }),
    );
  }
}
