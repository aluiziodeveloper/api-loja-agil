import { Body, Controller, Inject, Param, Post } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../../shared/infrastructure/http/zod-validation.pipe.js';
import { ReceiveStockUseCase } from '../../application/use-cases/receive-stock.use-case.js';
import { presentStock, type StockResponse } from './stock.presenter.js';

export const receiveStockBody = z.object({ quantity: z.number() });

type ReceiveStockBody = z.infer<typeof receiveStockBody>;

/** Cada entrada é um registro novo no histórico: POST e 201. */
@Controller('stock')
export class ReceiveStockController {
  constructor(
    @Inject(ReceiveStockUseCase)
    private readonly receiveStock: ReceiveStockUseCase,
  ) {}

  @Post(':sku/receipts')
  async handle(
    @Param('sku') sku: string,
    @Body(new ZodValidationPipe(receiveStockBody)) body: ReceiveStockBody,
  ): Promise<StockResponse> {
    return presentStock(await this.receiveStock.execute({ sku, ...body }));
  }
}
