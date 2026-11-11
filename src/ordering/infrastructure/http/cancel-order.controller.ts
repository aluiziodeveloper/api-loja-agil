import {
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiData,
  ApiErrors,
} from '../../../shared/infrastructure/openapi/api-docs.decorators.js';
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
  @ApiOperation({ summary: 'Cancela um pedido.' })
  @ApiErrors(
    'INVALID_ID',
    'ORDER_NOT_FOUND',
    'INVALID_ORDER_TRANSITION',
    'CONCURRENT_UPDATE',
  )
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
