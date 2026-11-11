import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetProductUseCase } from '../../application/use-cases/get-product.use-case.js';
import { presentProduct, type ProductResponse } from './product.presenter.js';
import { Public } from '../../../shared/infrastructure/auth/public.decorator.js';

@ApiTags('Catálogo')
@Controller('products')
export class GetProductController {
  constructor(
    @Inject(GetProductUseCase) private readonly getProduct: GetProductUseCase,
  ) {}

  @Public()
  @Get(':id')
  async handle(@Param('id') id: string): Promise<ProductResponse> {
    return presentProduct(await this.getProduct.execute({ productId: id }));
  }
}
