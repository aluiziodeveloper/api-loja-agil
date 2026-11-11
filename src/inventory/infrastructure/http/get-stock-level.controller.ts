import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiData,
  ApiErrors,
} from '../../../shared/infrastructure/openapi/api-docs.decorators.js';
import { GetStockLevelUseCase } from '../../application/use-cases/get-stock-level.use-case.js';
import {
  stockResponse,
  presentStock,
  type StockResponse,
} from './stock.presenter.js';
import { OPERATOR } from '../../../shared/infrastructure/auth/roles.js';
import { Roles } from '../../../shared/infrastructure/auth/roles.decorator.js';

/** O Estoque se organiza por SKU, a identidade que ele compartilha com o Catálogo. */
@ApiTags('Estoque')
@Controller('stock')
export class GetStockLevelController {
  constructor(
    @Inject(GetStockLevelUseCase)
    private readonly getStockLevel: GetStockLevelUseCase,
  ) {}

  @Get(':sku')
  @ApiOperation({ summary: 'Mostra o estoque de um SKU.' })
  @ApiErrors('INVALID_SKU', 'STOCK_ITEM_NOT_FOUND')
  @ApiData(stockResponse)
  @Roles(OPERATOR)
  async handle(@Param('sku') sku: string): Promise<StockResponse> {
    return presentStock(await this.getStockLevel.execute({ sku }));
  }
}
