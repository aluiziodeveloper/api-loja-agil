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
import { PayOrderUseCase } from '../../application/use-cases/pay-order.use-case.js';
import {
  orderResponse,
  type OrderResponse,
  presentOrder,
} from './order.presenter.js';
import { CurrentCustomer } from './current-customer.decorator.js';

/** Registra o pagamento e dá baixa nas unidades reservadas (RN13). */
@ApiTags('Pedidos')
@Controller('orders')
export class PayOrderController {
  constructor(
    @Inject(PayOrderUseCase) private readonly payOrder: PayOrderUseCase,
  ) {}

  @Post(':id/pay')
  @ApiOperation({ summary: 'Registra o pagamento de um pedido.' })
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
      await this.payOrder.execute({ orderId: id, customerId }),
    );
  }
}
