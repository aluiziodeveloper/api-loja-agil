import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiData,
  ApiErrors,
} from '../../../shared/infrastructure/openapi/api-docs.decorators.js';
import { GetOrderUseCase } from '../../application/use-cases/get-order.use-case.js';
import {
  orderResponse,
  type OrderResponse,
  presentOrder,
} from './order.presenter.js';
import { CurrentCustomer } from './current-customer.decorator.js';

/** Só o pedido do próprio cliente (RN15): o de outro responde 404. */
@ApiTags('Pedidos')
@Controller('orders')
export class GetOrderController {
  constructor(
    @Inject(GetOrderUseCase) private readonly getOrder: GetOrderUseCase,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Mostra um pedido do cliente.' })
  @ApiErrors('INVALID_ID', 'ORDER_NOT_FOUND')
  @ApiData(orderResponse)
  async handle(
    @CurrentCustomer() customerId: string,
    @Param('id') id: string,
  ): Promise<OrderResponse> {
    return presentOrder(
      await this.getOrder.execute({ orderId: id, customerId }),
    );
  }
}
