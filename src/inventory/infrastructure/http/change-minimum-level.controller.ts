import { Body, Controller, Inject, Param, Put } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../../shared/infrastructure/http/zod-validation.pipe.js';
import { ChangeMinimumLevelUseCase } from '../../application/use-cases/change-minimum-level.use-case.js';
import { presentStock, type StockResponse } from './stock.presenter.js';

export const changeMinimumLevelBody = z.object({ minimumLevel: z.number() });

type ChangeMinimumLevelBody = z.infer<typeof changeMinimumLevelBody>;

/** PUT: o nível mínimo é substituído inteiro, e repetir dá o mesmo resultado. */
@Controller('stock')
export class ChangeMinimumLevelController {
  constructor(
    @Inject(ChangeMinimumLevelUseCase)
    private readonly changeMinimumLevel: ChangeMinimumLevelUseCase,
  ) {}

  @Put(':sku/minimum-level')
  async handle(
    @Param('sku') sku: string,
    @Body(new ZodValidationPipe(changeMinimumLevelBody))
    body: ChangeMinimumLevelBody,
  ): Promise<StockResponse> {
    const output = await this.changeMinimumLevel.execute({ sku, ...body });
    return presentStock(output);
  }
}
