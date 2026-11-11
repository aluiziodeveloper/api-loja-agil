import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiErrors,
  ApiPage,
  ApiQueryOf,
} from '../../../shared/infrastructure/openapi/api-docs.decorators.js';
import type { z } from 'zod';
import {
  type Page,
  presentPage,
} from '../../../shared/infrastructure/http/page.js';
import { searchQuery } from '../../../shared/infrastructure/http/search-query.js';
import { ZodValidationPipe } from '../../../shared/infrastructure/http/zod-validation.pipe.js';
import { ListCustomerOrdersUseCase } from '../../application/use-cases/list-customer-orders.use-case.js';
import { CurrentCustomer } from './current-customer.decorator.js';
import {
  orderResponse,
  type OrderResponse,
  presentOrder,
} from './order.presenter.js';

/** Os pedidos de quem pede, os mais recentes primeiro. */
export const listCustomerOrdersQuery = searchQuery.pick({
  page: true,
  perPage: true,
  sortDirection: true,
});

type ListCustomerOrdersQuery = z.infer<typeof listCustomerOrdersQuery>;

@ApiTags('Pedidos')
@Controller('orders')
export class ListCustomerOrdersController {
  constructor(
    @Inject(ListCustomerOrdersUseCase)
    private readonly listCustomerOrders: ListCustomerOrdersUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista os pedidos do cliente.' })
  @ApiErrors('INVALID_SEARCH_PARAMS')
  @ApiQueryOf(listCustomerOrdersQuery)
  @ApiPage(orderResponse)
  async handle(
    @CurrentCustomer() customerId: string,
    @Query(new ZodValidationPipe(listCustomerOrdersQuery))
    query: ListCustomerOrdersQuery,
  ): Promise<Page<OrderResponse>> {
    const output = await this.listCustomerOrders.execute({
      customerId,
      ...query,
    });
    return presentPage(output, presentOrder);
  }
}
