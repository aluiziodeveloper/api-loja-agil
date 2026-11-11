import { Body, Controller, Inject, Param, Patch } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../../shared/infrastructure/http/zod-validation.pipe.js';
import { UpdateProductUseCase } from '../../application/use-cases/update-product.use-case.js';
import { presentProduct, type ProductResponse } from './product.presenter.js';

/** PATCH: só muda o que vier. O SKU é a identidade do produto e não muda. */
export const updateProductBody = z.object({
  name: z.string().optional(),
  priceInCents: z.number().optional(),
});

type UpdateProductBody = z.infer<typeof updateProductBody>;

@Controller('products')
export class UpdateProductController {
  constructor(
    @Inject(UpdateProductUseCase)
    private readonly updateProduct: UpdateProductUseCase,
  ) {}

  @Patch(':id')
  async handle(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProductBody)) body: UpdateProductBody,
  ): Promise<ProductResponse> {
    const output = await this.updateProduct.execute({ productId: id, ...body });
    return presentProduct(output);
  }
}
