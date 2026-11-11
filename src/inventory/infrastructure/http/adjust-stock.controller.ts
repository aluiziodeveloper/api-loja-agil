import {
  Body,
  Controller,
  Inject,
  Param,
  Post,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiBodyOf,
  ApiData,
  ApiErrors,
} from '../../../shared/infrastructure/openapi/api-docs.decorators.js';
import { z } from 'zod';
import { ZodValidationPipe } from '../../../shared/infrastructure/http/zod-validation.pipe.js';
import { AdjustStockUseCase } from '../../application/use-cases/adjust-stock.use-case.js';
import {
  stockResponse,
  presentStock,
  type StockResponse,
} from './stock.presenter.js';
import { OPERATOR } from '../../../shared/infrastructure/auth/roles.js';
import { Roles } from '../../../shared/infrastructure/auth/roles.decorator.js';

/** O motivo é obrigatório pela regra do domínio, não pelo schema. */
export const adjustStockBody = z.object({
  countedQuantity: z.number(),
  reason: z.string(),
});

type AdjustStockBody = z.infer<typeof adjustStockBody>;

@ApiTags('Estoque')
@Controller('stock')
export class AdjustStockController {
  constructor(
    @Inject(AdjustStockUseCase)
    private readonly adjustStock: AdjustStockUseCase,
  ) {}

  @Post(':sku/adjustments')
  @ApiOperation({ summary: 'Ajusta o estoque pela contagem, com o motivo.' })
  @ApiErrors(
    'INVALID_SKU',
    'STOCK_ITEM_NOT_FOUND',
    'INVALID_STOCK_QUANTITY',
    'MISSING_ADJUSTMENT_REASON',
    'EMPTY_STOCK_MOVEMENT',
    'STOCK_BELOW_RESERVED',
    'CONCURRENT_UPDATE',
  )
  @ApiBodyOf(adjustStockBody)
  @ApiData(stockResponse, HttpStatus.CREATED)
  @Roles(OPERATOR)
  async handle(
    @Param('sku') sku: string,
    @Body(new ZodValidationPipe(adjustStockBody)) body: AdjustStockBody,
  ): Promise<StockResponse> {
    return presentStock(await this.adjustStock.execute({ sku, ...body }));
  }
}
