import { Controller, Get, Inject, Query } from '@nestjs/common';
import { z } from 'zod';
import {
  type Page,
  presentPage,
} from '../../../shared/infrastructure/http/page.js';
import { searchQuery } from '../../../shared/infrastructure/http/search-query.js';
import { ZodValidationPipe } from '../../../shared/infrastructure/http/zod-validation.pipe.js';
import { SearchProductsUseCase } from '../../application/use-cases/search-products.use-case.js';
import { presentProduct, type ProductResponse } from './product.presenter.js';
import { Public } from '../../../shared/infrastructure/auth/public.decorator.js';

/** `?includeInactive=true` traz também os produtos desativados. */
export const searchProductsQuery = searchQuery.extend({
  includeInactive: z.stringbool().optional(),
});

type SearchProductsQuery = z.infer<typeof searchProductsQuery>;

@Controller('products')
export class SearchProductsController {
  constructor(
    @Inject(SearchProductsUseCase)
    private readonly searchProducts: SearchProductsUseCase,
  ) {}

  @Public()
  @Get()
  async handle(
    @Query(new ZodValidationPipe(searchProductsQuery))
    { includeInactive = false, ...query }: SearchProductsQuery,
  ): Promise<Page<ProductResponse>> {
    const output = await this.searchProducts.execute({
      ...query,
      activeOnly: !includeInactive,
    });
    return presentPage(output, presentProduct);
  }
}
