import { Controller, Delete, Inject, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiData,
  ApiErrors,
} from '../../../shared/infrastructure/openapi/api-docs.decorators.js';
import { RemoveOrderItemUseCase } from '../../application/use-cases/remove-order-item.use-case.js';
import {
  orderResponse,
  type OrderResponse,
  presentOrder,
} from './order.presenter.js';
import { CurrentCustomer } from './current-customer.decorator.js';

@ApiTags('Pedidos')
@Controller('orders')
export class RemoveOrderItemController {
  constructor(
    @Inject(RemoveOrderItemUseCase)
    private readonly removeOrderItem: RemoveOrderItemUseCase,
  ) {}

  @Delete(':id/items/:sku')
  @ApiOperation({ summary: 'Tira um produto do rascunho do pedido.' })
  @ApiErrors(
    'INVALID_ID',
    'ORDER_NOT_FOUND',
    'ORDER_NOT_EDITABLE',
    'INVALID_SKU',
    'ORDER_ITEM_NOT_FOUND',
  )
  @ApiData(orderResponse)
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
