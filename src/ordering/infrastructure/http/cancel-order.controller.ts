import {
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { CancelOrderUseCase } from '../../application/use-cases/cancel-order.use-case.js';
import { type OrderResponse, presentOrder } from './order.presenter.js';

/** Cancela e devolve ao estoque o que estava reservado ou vendido. */
@Controller('orders')
export class CancelOrderController {
  constructor(
    @Inject(CancelOrderUseCase)
    private readonly cancelOrder: CancelOrderUseCase,
  ) {}

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async handle(@Param('id') id: string): Promise<OrderResponse> {
    return presentOrder(await this.cancelOrder.execute({ orderId: id }));
  }
}
