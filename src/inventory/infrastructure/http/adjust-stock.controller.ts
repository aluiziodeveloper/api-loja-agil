import { Body, Controller, Inject, Param, Post } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../../shared/infrastructure/http/zod-validation.pipe.js';
import { AdjustStockUseCase } from '../../application/use-cases/adjust-stock.use-case.js';
import { presentStock, type StockResponse } from './stock.presenter.js';

/** O motivo é obrigatório pela regra do domínio, não pelo schema. */
export const adjustStockBody = z.object({
  countedQuantity: z.number(),
  reason: z.string(),
});

type AdjustStockBody = z.infer<typeof adjustStockBody>;

@Controller('stock')
export class AdjustStockController {
  constructor(
    @Inject(AdjustStockUseCase)
    private readonly adjustStock: AdjustStockUseCase,
  ) {}

  @Post(':sku/adjustments')
  async handle(
    @Param('sku') sku: string,
    @Body(new ZodValidationPipe(adjustStockBody)) body: AdjustStockBody,
  ): Promise<StockResponse> {
    return presentStock(await this.adjustStock.execute({ sku, ...body }));
  }
}
