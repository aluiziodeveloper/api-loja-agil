import { Controller, Inject, Post, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiData } from '../../../shared/infrastructure/openapi/api-docs.decorators.js';
import { CreateDraftOrderUseCase } from '../../application/use-cases/create-draft-order.use-case.js';
import { CurrentCustomer } from './current-customer.decorator.js';
import {
  orderResponse,
  type OrderResponse,
  presentOrder,
} from './order.presenter.js';

/** O dono do pedido vem de quem pede, nunca do corpo da requisição. */
@ApiTags('Pedidos')
@Controller('orders')
export class CreateDraftOrderController {
  constructor(
    @Inject(CreateDraftOrderUseCase)
    private readonly createDraftOrder: CreateDraftOrderUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Abre um rascunho de pedido.' })
  @ApiData(orderResponse, HttpStatus.CREATED)
  async handle(@CurrentCustomer() customerId: string): Promise<OrderResponse> {
    return presentOrder(await this.createDraftOrder.execute({ customerId }));
  }
}
