import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
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
import { ListStockMovementsUseCase } from '../../application/use-cases/list-stock-movements.use-case.js';
import {
  movementResponse,
  type MovementResponse,
  presentMovement,
} from './stock.presenter.js';
import { OPERATOR } from '../../../shared/infrastructure/auth/roles.js';
import { Roles } from '../../../shared/infrastructure/auth/roles.decorator.js';

/** O histórico só se ordena pela data: sem `sort` nem `filter`. */
export const listStockMovementsQuery = searchQuery.pick({
  page: true,
  perPage: true,
  sortDirection: true,
});

type ListStockMovementsQuery = z.infer<typeof listStockMovementsQuery>;

@ApiTags('Estoque')
@Controller('stock')
export class ListStockMovementsController {
  constructor(
    @Inject(ListStockMovementsUseCase)
    private readonly listStockMovements: ListStockMovementsUseCase,
  ) {}

  @Get(':sku/movements')
  @ApiQueryOf(listStockMovementsQuery)
  @ApiPage(movementResponse)
  @Roles(OPERATOR)
  async handle(
    @Param('sku') sku: string,
    @Query(new ZodValidationPipe(listStockMovementsQuery))
    query: ListStockMovementsQuery,
  ): Promise<Page<MovementResponse>> {
    const output = await this.listStockMovements.execute({ sku, ...query });
    return presentPage(output, presentMovement);
  }
}
