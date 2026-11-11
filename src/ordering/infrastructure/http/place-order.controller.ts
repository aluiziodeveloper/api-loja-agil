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
import { PlaceOrderUseCase } from '../../application/use-cases/place-order.use-case.js';
import {
  orderResponse,
  type OrderResponse,
  presentOrder,
} from './order.presenter.js';
import { CurrentCustomer } from './current-customer.decorator.js';

/** Confirma o pedido e reserva o estoque, na mesma transação (RN12). */
@ApiTags('Pedidos')
@Controller('orders')
export class PlaceOrderController {
  constructor(
    @Inject(PlaceOrderUseCase) private readonly placeOrder: PlaceOrderUseCase,
  ) {}

  @Post(':id/place')
  @ApiOperation({ summary: 'Confirma o pedido e reserva o estoque.' })
  @ApiErrors(
    'INVALID_ID',
    'ORDER_NOT_FOUND',
    'INVALID_ORDER_TRANSITION',
    'EMPTY_ORDER',
    'COUPON_NOT_APPLICABLE',
    'STOCK_SHORTAGE',
    'CONCURRENT_UPDATE',
  )
  @ApiData(orderResponse)
  @HttpCode(HttpStatus.OK)
  async handle(
    @CurrentCustomer() customerId: string,
    @Param('id') id: string,
  ): Promise<OrderResponse> {
    return presentOrder(
      await this.placeOrder.execute({ orderId: id, customerId }),
    );
  }
}
