import { Body, Controller, Inject, Post } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../../shared/infrastructure/http/zod-validation.pipe.js';
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case.js';
import { presentProduct, type ProductResponse } from './product.presenter.js';

/** Inteiro, positivo, formato do SKU: tudo isso é do `Money` e do `Sku`. */
export const createProductBody = z.object({
  sku: z.string(),
  name: z.string(),
  priceInCents: z.number(),
});

type CreateProductBody = z.infer<typeof createProductBody>;

@Controller('products')
export class CreateProductController {
  constructor(
    @Inject(CreateProductUseCase)
    private readonly createProduct: CreateProductUseCase,
  ) {}

  @Post()
  async handle(
    @Body(new ZodValidationPipe(createProductBody)) body: CreateProductBody,
  ): Promise<ProductResponse> {
    return presentProduct(await this.createProduct.execute(body));
  }
}
