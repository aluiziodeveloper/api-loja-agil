import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiData,
  ApiErrors,
} from '../../../shared/infrastructure/openapi/api-docs.decorators.js';
import { GetProductUseCase } from '../../application/use-cases/get-product.use-case.js';
import {
  productResponse,
  presentProduct,
  type ProductResponse,
} from './product.presenter.js';
import { Public } from '../../../shared/infrastructure/auth/public.decorator.js';

@ApiTags('Catálogo')
@Controller('products')
export class GetProductController {
  constructor(
    @Inject(GetProductUseCase) private readonly getProduct: GetProductUseCase,
  ) {}

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Mostra um produto.' })
  @ApiErrors('INVALID_ID', 'PRODUCT_NOT_FOUND')
  @ApiData(productResponse)
  async handle(@Param('id') id: string): Promise<ProductResponse> {
    return presentProduct(await this.getProduct.execute({ productId: id }));
  }
}
