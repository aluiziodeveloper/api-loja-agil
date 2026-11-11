import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiBodyOf,
  ApiData,
} from '../../../shared/infrastructure/openapi/api-docs.decorators.js';
import { z } from 'zod';
import { ZodValidationPipe } from '../../../shared/infrastructure/http/zod-validation.pipe.js';
import { AddOrderItemUseCase } from '../../application/use-cases/add-order-item.use-case.js';
import {
  orderResponse,
  type OrderResponse,
  presentOrder,
} from './order.presenter.js';
import { CurrentCustomer } from './current-customer.decorator.js';

/** O preço não vem do cliente: o Pedido o lê do Catálogo. */
export const addOrderItemBody = z.object({
  sku: z.string(),
  quantity: z.number(),
});

type AddOrderItemBody = z.infer<typeof addOrderItemBody>;

/** 200: a resposta é o pedido, não um item como recurso próprio. */
@ApiTags('Pedidos')
@Controller('orders')
export class AddOrderItemController {
  constructor(
    @Inject(AddOrderItemUseCase)
    private readonly addOrderItem: AddOrderItemUseCase,
  ) {}

  @Post(':id/items')
  @ApiBodyOf(addOrderItemBody)
  @ApiData(orderResponse)
  @HttpCode(HttpStatus.OK)
  async handle(
    @CurrentCustomer() customerId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(addOrderItemBody)) body: AddOrderItemBody,
  ): Promise<OrderResponse> {
    const output = await this.addOrderItem.execute({
      orderId: id,
      customerId,
      ...body,
    });
    return presentOrder(output);
  }
}
