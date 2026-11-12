import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiErrors,
  ApiPage,
  ApiQueryOf,
} from '../../../shared/infrastructure/openapi/api-docs.decorators.js';
import { z } from 'zod';
import {
  type Page,
  presentPage,
} from '../../../shared/infrastructure/http/page.js';
import {
  searchQuery,
  sortQuery,
} from '../../../shared/infrastructure/http/search-query.js';
import { productSearchOptions } from '../../application/product-search.js';
import { ZodValidationPipe } from '../../../shared/infrastructure/http/zod-validation.pipe.js';
import { SearchProductsUseCase } from '../../application/use-cases/search-products.use-case.js';
import {
  productResponse,
  presentProduct,
  type ProductResponse,
} from './product.presenter.js';
import type { Principal } from '../../../shared/infrastructure/auth/access-tokens.js';
import {
  OptionalPrincipal,
  requireRole,
} from '../../../shared/infrastructure/auth/principal.js';
import { Public } from '../../../shared/infrastructure/auth/public.decorator.js';
import { OPERATOR } from '../../../shared/infrastructure/auth/roles.js';

/** `?includeInactive=true` traz também os produtos desativados, só para o operador. */
export const searchProductsQuery = searchQuery.extend({
  sort: sortQuery(productSearchOptions),
  includeInactive: z.stringbool().optional(),
});

type SearchProductsQuery = z.infer<typeof searchProductsQuery>;

@ApiTags('Catálogo')
@Controller('products')
export class SearchProductsController {
  constructor(
    @Inject(SearchProductsUseCase)
    private readonly searchProducts: SearchProductsUseCase,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Busca produtos, com filtro, ordenação e página.' })
  @ApiErrors('INVALID_SEARCH_PARAMS', 'UNAUTHORIZED', 'FORBIDDEN')
  @ApiQueryOf(searchProductsQuery)
  @ApiPage(productResponse)
  async handle(
    @Query(new ZodValidationPipe(searchProductsQuery))
    { includeInactive = false, ...query }: SearchProductsQuery,
    @OptionalPrincipal() principal: Principal | undefined,
  ): Promise<Page<ProductResponse>> {
    if (includeInactive) {
      requireRole(principal, OPERATOR);
    }
    const output = await this.searchProducts.execute({
      ...query,
      activeOnly: !includeInactive,
    });
    return presentPage(output, presentProduct);
  }
}
