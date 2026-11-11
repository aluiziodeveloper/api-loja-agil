import {
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { DeactivateProductUseCase } from '../../application/use-cases/deactivate-product.use-case.js';
import { presentProduct, type ProductResponse } from './product.presenter.js';
import { OPERATOR } from '../../../shared/infrastructure/auth/roles.js';
import { Roles } from '../../../shared/infrastructure/auth/roles.decorator.js';

/** Uma ação do domínio vira um recurso próprio: POST /products/:id/deactivate. */
@Controller('products')
export class DeactivateProductController {
  constructor(
    @Inject(DeactivateProductUseCase)
    private readonly deactivateProduct: DeactivateProductUseCase,
  ) {}

  @Post(':id/deactivate')
  @Roles(OPERATOR)
  @HttpCode(HttpStatus.OK)
  async handle(@Param('id') id: string): Promise<ProductResponse> {
    return presentProduct(
      await this.deactivateProduct.execute({ productId: id }),
    );
  }
}
