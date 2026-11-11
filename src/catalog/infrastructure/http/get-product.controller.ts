import { Controller, Get, Inject, Param } from '@nestjs/common';
import { GetProductUseCase } from '../../application/use-cases/get-product.use-case.js';
import { presentProduct, type ProductResponse } from './product.presenter.js';

@Controller('products')
export class GetProductController {
  constructor(
    @Inject(GetProductUseCase) private readonly getProduct: GetProductUseCase,
  ) {}

  @Get(':id')
  async handle(@Param('id') id: string): Promise<ProductResponse> {
    return presentProduct(await this.getProduct.execute({ productId: id }));
  }
}
