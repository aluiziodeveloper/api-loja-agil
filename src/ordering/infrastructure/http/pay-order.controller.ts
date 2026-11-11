import {
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { PayOrderUseCase } from '../../application/use-cases/pay-order.use-case.js';
import { type OrderResponse, presentOrder } from './order.presenter.js';
import { CurrentCustomer } from './current-customer.decorator.js';

/** Registra o pagamento e dá baixa nas unidades reservadas (RN13). */
@Controller('orders')
export class PayOrderController {
  constructor(
    @Inject(PayOrderUseCase) private readonly payOrder: PayOrderUseCase,
  ) {}

  @Post(':id/pay')
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
