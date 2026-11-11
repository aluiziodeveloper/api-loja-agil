import {
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { ShipOrderUseCase } from '../../application/use-cases/ship-order.use-case.js';
import { type OrderResponse, presentOrder } from './order.presenter.js';
import { OPERATOR } from '../../../shared/infrastructure/auth/roles.js';
import { Roles } from '../../../shared/infrastructure/auth/roles.decorator.js';

/** Despacha um pedido pago. */
@Controller('orders')
export class ShipOrderController {
  constructor(
    @Inject(ShipOrderUseCase) private readonly shipOrder: ShipOrderUseCase,
  ) {}

  @Post(':id/ship')
  @Roles(OPERATOR)
  @HttpCode(HttpStatus.OK)
  async handle(@Param('id') id: string): Promise<OrderResponse> {
    return presentOrder(await this.shipOrder.execute({ orderId: id }));
  }
}
