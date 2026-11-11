import { Controller, Inject, Post } from '@nestjs/common';
import { CreateDraftOrderUseCase } from '../../application/use-cases/create-draft-order.use-case.js';
import { CurrentCustomer } from './current-customer.decorator.js';
import { type OrderResponse, presentOrder } from './order.presenter.js';

/** O dono do pedido vem de quem pede, nunca do corpo da requisição. */
@Controller('orders')
export class CreateDraftOrderController {
  constructor(
    @Inject(CreateDraftOrderUseCase)
    private readonly createDraftOrder: CreateDraftOrderUseCase,
  ) {}

  @Post()
  async handle(@CurrentCustomer() customerId: string): Promise<OrderResponse> {
    return presentOrder(await this.createDraftOrder.execute({ customerId }));
  }
}
