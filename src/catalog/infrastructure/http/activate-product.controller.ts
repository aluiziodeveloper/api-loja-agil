import {
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { ActivateProductUseCase } from '../../application/use-cases/activate-product.use-case.js';
import { presentProduct, type ProductResponse } from './product.presenter.js';

/** Uma ação do domínio vira um recurso próprio: POST /products/:id/activate. */
@Controller('products')
export class ActivateProductController {
  constructor(
    @Inject(ActivateProductUseCase)
    private readonly activateProduct: ActivateProductUseCase,
  ) {}

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  async handle(@Param('id') id: string): Promise<ProductResponse> {
    return presentProduct(
      await this.activateProduct.execute({ productId: id }),
    );
  }
}
