import { Body, Controller, Inject, Param, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiBodyOf,
  ApiData,
  ApiErrors,
} from '../../../shared/infrastructure/openapi/api-docs.decorators.js';
import { z } from 'zod';
import { ZodValidationPipe } from '../../../shared/infrastructure/http/zod-validation.pipe.js';
import { ChangeMinimumLevelUseCase } from '../../application/use-cases/change-minimum-level.use-case.js';
import {
  stockResponse,
  presentStock,
  type StockResponse,
} from './stock.presenter.js';
import { OPERATOR } from '../../../shared/infrastructure/auth/roles.js';
import { Roles } from '../../../shared/infrastructure/auth/roles.decorator.js';

export const changeMinimumLevelBody = z.object({ minimumLevel: z.number() });

type ChangeMinimumLevelBody = z.infer<typeof changeMinimumLevelBody>;

/** PUT: o nível mínimo é substituído inteiro, e repetir dá o mesmo resultado. */
@ApiTags('Estoque')
@Controller('stock')
export class ChangeMinimumLevelController {
  constructor(
    @Inject(ChangeMinimumLevelUseCase)
    private readonly changeMinimumLevel: ChangeMinimumLevelUseCase,
  ) {}

  @Put(':sku/minimum-level')
  @ApiOperation({ summary: 'Muda o nível mínimo de um SKU.' })
  @ApiErrors(
    'INVALID_SKU',
    'STOCK_ITEM_NOT_FOUND',
    'INVALID_STOCK_QUANTITY',
    'CONCURRENT_UPDATE',
  )
  @ApiBodyOf(changeMinimumLevelBody)
  @ApiData(stockResponse)
  @Roles(OPERATOR)
  async handle(
    @Param('sku') sku: string,
    @Body(new ZodValidationPipe(changeMinimumLevelBody))
    body: ChangeMinimumLevelBody,
  ): Promise<StockResponse> {
    const output = await this.changeMinimumLevel.execute({ sku, ...body });
    return presentStock(output);
  }
}
