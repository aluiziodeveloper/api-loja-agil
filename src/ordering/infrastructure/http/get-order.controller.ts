import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetOrderUseCase } from '../../application/use-cases/get-order.use-case.js';
import { type OrderResponse, presentOrder } from './order.presenter.js';
import { CurrentCustomer } from './current-customer.decorator.js';

/** Só o pedido do próprio cliente (RN15): o de outro responde 404. */
@ApiTags('Pedidos')
@Controller('orders')
export class GetOrderController {
  constructor(
    @Inject(GetOrderUseCase) private readonly getOrder: GetOrderUseCase,
  ) {}

  @Get(':id')
  async handle(
    @CurrentCustomer() customerId: string,
    @Param('id') id: string,
  ): Promise<OrderResponse> {
    return presentOrder(
      await this.getOrder.execute({ orderId: id, customerId }),
    );
  }
}
