import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiData } from '../../../shared/infrastructure/openapi/api-docs.decorators.js';
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
  @ApiData(stockResponse)
  @Roles(OPERATOR)
  async handle(@Param('sku') sku: string): Promise<StockResponse> {
    return presentStock(await this.getStockLevel.execute({ sku }));
  }
}
