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
import { ReceiveStockUseCase } from '../../application/use-cases/receive-stock.use-case.js';
import {
  stockResponse,
  presentStock,
  type StockResponse,
} from './stock.presenter.js';
import { OPERATOR } from '../../../shared/infrastructure/auth/roles.js';
import { Roles } from '../../../shared/infrastructure/auth/roles.decorator.js';

export const receiveStockBody = z.object({ quantity: z.number() });

type ReceiveStockBody = z.infer<typeof receiveStockBody>;

/** Cada entrada é um registro novo no histórico: POST e 201. */
@ApiTags('Estoque')
@Controller('stock')
export class ReceiveStockController {
  constructor(
    @Inject(ReceiveStockUseCase)
    private readonly receiveStock: ReceiveStockUseCase,
  ) {}

  @Post(':sku/receipts')
  @ApiOperation({ summary: 'Registra a entrada de unidades de um SKU.' })
  @ApiErrors(
    'INVALID_SKU',
    'INVALID_STOCK_QUANTITY',
    'EMPTY_STOCK_MOVEMENT',
    'CONCURRENT_UPDATE',
  )
  @ApiBodyOf(receiveStockBody)
  @ApiData(stockResponse, HttpStatus.CREATED)
  @Roles(OPERATOR)
  async handle(
    @Param('sku') sku: string,
    @Body(new ZodValidationPipe(receiveStockBody)) body: ReceiveStockBody,
  ): Promise<StockResponse> {
    return presentStock(await this.receiveStock.execute({ sku, ...body }));
  }
}
