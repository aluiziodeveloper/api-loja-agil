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
import { ShipOrderUseCase } from '../../application/use-cases/ship-order.use-case.js';
import {
  orderResponse,
  type OrderResponse,
  presentOrder,
} from './order.presenter.js';
import { OPERATOR } from '../../../shared/infrastructure/auth/roles.js';
import { Roles } from '../../../shared/infrastructure/auth/roles.decorator.js';

/** Despacha um pedido pago. */
@ApiTags('Pedidos')
@Controller('orders')
export class ShipOrderController {
  constructor(
    @Inject(ShipOrderUseCase) private readonly shipOrder: ShipOrderUseCase,
  ) {}

  @Post(':id/ship')
  @ApiData(orderResponse)
  @Roles(OPERATOR)
  @HttpCode(HttpStatus.OK)
  async handle(@Param('id') id: string): Promise<OrderResponse> {
    return presentOrder(await this.shipOrder.execute({ orderId: id }));
  }
}
