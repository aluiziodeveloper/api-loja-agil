import {
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiData } from '../../../shared/infrastructure/openapi/api-docs.decorators.js';
import { CancelOrderUseCase } from '../../application/use-cases/cancel-order.use-case.js';
import {
  orderResponse,
  type OrderResponse,
  presentOrder,
} from './order.presenter.js';
import { CurrentCustomer } from './current-customer.decorator.js';

/** Cancela e devolve ao estoque o que estava reservado ou vendido. */
@ApiTags('Pedidos')
@Controller('orders')
export class CancelOrderController {
  constructor(
    @Inject(CancelOrderUseCase)
    private readonly cancelOrder: CancelOrderUseCase,
  ) {}

  @Post(':id/cancel')
  @ApiData(orderResponse)
  @HttpCode(HttpStatus.OK)
  async handle(
    @CurrentCustomer() customerId: string,
    @Param('id') id: string,
  ): Promise<OrderResponse> {
    return presentOrder(
      await this.cancelOrder.execute({ orderId: id, customerId }),
    );
  }
}
