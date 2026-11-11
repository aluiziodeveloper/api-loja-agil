import { Body, Controller, Inject, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { ZodValidationPipe } from '../../../shared/infrastructure/http/zod-validation.pipe.js';
import { UpdateProductUseCase } from '../../application/use-cases/update-product.use-case.js';
import { presentProduct, type ProductResponse } from './product.presenter.js';
import { OPERATOR } from '../../../shared/infrastructure/auth/roles.js';
import { Roles } from '../../../shared/infrastructure/auth/roles.decorator.js';

/** PATCH: só muda o que vier. O SKU é a identidade do produto e não muda. */
export const updateProductBody = z.object({
  name: z.string().optional(),
  priceInCents: z.number().optional(),
});

type UpdateProductBody = z.infer<typeof updateProductBody>;

@ApiTags('Catálogo')
@Controller('products')
export class UpdateProductController {
  constructor(
    @Inject(UpdateProductUseCase)
    private readonly updateProduct: UpdateProductUseCase,
  ) {}

  @Patch(':id')
  @Roles(OPERATOR)
  async handle(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProductBody)) body: UpdateProductBody,
  ): Promise<ProductResponse> {
    const output = await this.updateProduct.execute({ productId: id, ...body });
    return presentProduct(output);
  }
}
