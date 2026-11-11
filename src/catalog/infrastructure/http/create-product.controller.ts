import { Body, Controller, Inject, Post, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiBodyOf,
  ApiData,
  ApiErrors,
} from '../../../shared/infrastructure/openapi/api-docs.decorators.js';
import { z } from 'zod';
import { ZodValidationPipe } from '../../../shared/infrastructure/http/zod-validation.pipe.js';
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case.js';
import {
  productResponse,
  presentProduct,
  type ProductResponse,
} from './product.presenter.js';
import { OPERATOR } from '../../../shared/infrastructure/auth/roles.js';
import { Roles } from '../../../shared/infrastructure/auth/roles.decorator.js';

/** Inteiro, positivo, formato do SKU: tudo isso é do `Money` e do `Sku`. */
export const createProductBody = z.object({
  sku: z.string(),
  name: z.string(),
  priceInCents: z.number(),
});

type CreateProductBody = z.infer<typeof createProductBody>;

@ApiTags('Catálogo')
@Controller('products')
export class CreateProductController {
  constructor(
    @Inject(CreateProductUseCase)
    private readonly createProduct: CreateProductUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um produto no catálogo.' })
  @ApiErrors(
    'INVALID_SKU',
    'INVALID_PRODUCT_NAME',
    'INVALID_MONEY',
    'SKU_ALREADY_IN_USE',
  )
  @ApiBodyOf(createProductBody)
  @ApiData(productResponse, HttpStatus.CREATED)
  @Roles(OPERATOR)
  async handle(
    @Body(new ZodValidationPipe(createProductBody)) body: CreateProductBody,
  ): Promise<ProductResponse> {
    return presentProduct(await this.createProduct.execute(body));
  }
}
