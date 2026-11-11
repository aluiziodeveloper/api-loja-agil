import { Controller, Delete, Inject, Param } from '@nestjs/common';
import { RemoveOrderItemUseCase } from '../../application/use-cases/remove-order-item.use-case.js';
import { type OrderResponse, presentOrder } from './order.presenter.js';
import { CurrentCustomer } from './current-customer.decorator.js';

@Controller('orders')
export class RemoveOrderItemController {
  constructor(
    @Inject(RemoveOrderItemUseCase)
    private readonly removeOrderItem: RemoveOrderItemUseCase,
  ) {}

  @Delete(':id/items/:sku')
  async handle(
    @CurrentCustomer() customerId: string,
    @Param('id') id: string,
    @Param('sku') sku: string,
  ): Promise<OrderResponse> {
    const output = await this.removeOrderItem.execute({
      orderId: id,
      customerId,
      sku,
    });
    return presentOrder(output);
  }
}
