import { Controller, Get, Inject, Param } from '@nestjs/common';
import { GetOrderUseCase } from '../../application/use-cases/get-order.use-case.js';
import { type OrderResponse, presentOrder } from './order.presenter.js';

/** Sem conferir o dono ainda: a posse do pedido (RN15) chega no módulo 12. */
@Controller('orders')
export class GetOrderController {
  constructor(
    @Inject(GetOrderUseCase) private readonly getOrder: GetOrderUseCase,
  ) {}

  @Get(':id')
  async handle(@Param('id') id: string): Promise<OrderResponse> {
    return presentOrder(await this.getOrder.execute({ orderId: id }));
  }
}
