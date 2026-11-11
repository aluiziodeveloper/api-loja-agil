import {
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ActivateProductUseCase } from '../../application/use-cases/activate-product.use-case.js';
import { presentProduct, type ProductResponse } from './product.presenter.js';
import { OPERATOR } from '../../../shared/infrastructure/auth/roles.js';
import { Roles } from '../../../shared/infrastructure/auth/roles.decorator.js';

/** Uma ação do domínio vira um recurso próprio: POST /products/:id/activate. */
@ApiTags('Catálogo')
@Controller('products')
export class ActivateProductController {
  constructor(
    @Inject(ActivateProductUseCase)
    private readonly activateProduct: ActivateProductUseCase,
  ) {}

  @Post(':id/activate')
  @Roles(OPERATOR)
  @HttpCode(HttpStatus.OK)
  async handle(@Param('id') id: string): Promise<ProductResponse> {
    return presentProduct(
      await this.activateProduct.execute({ productId: id }),
    );
  }
}
