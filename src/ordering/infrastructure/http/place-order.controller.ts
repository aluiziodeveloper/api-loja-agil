import {
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { PlaceOrderUseCase } from '../../application/use-cases/place-order.use-case.js';
import { type OrderResponse, presentOrder } from './order.presenter.js';

/** Confirma o pedido e reserva o estoque, na mesma transação (RN12). */
@Controller('orders')
export class PlaceOrderController {
  constructor(
    @Inject(PlaceOrderUseCase) private readonly placeOrder: PlaceOrderUseCase,
  ) {}

  @Post(':id/place')
  @HttpCode(HttpStatus.OK)
  async handle(@Param('id') id: string): Promise<OrderResponse> {
    return presentOrder(await this.placeOrder.execute({ orderId: id }));
  }
}
