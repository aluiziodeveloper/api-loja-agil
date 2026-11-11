import { Module } from '@nestjs/common';
import { PrismaDatabase } from '../shared/infrastructure/database/prisma-database.js';
import { provideUseCase } from '../shared/infrastructure/nest/provide-use-case.js';
import { ProductRepository } from './application/ports/product.repository.js';
import { SearchProductsUseCase } from './application/use-cases/search-products.use-case.js';
import { SearchProductsController } from './infrastructure/http/search-products.controller.js';
import { PrismaProductRepository } from './infrastructure/persistence/prisma-product.repository.js';

@Module({
  controllers: [SearchProductsController],
  providers: [
    {
      provide: ProductRepository,
      useFactory: (database: PrismaDatabase) =>
        new PrismaProductRepository(database),
      inject: [PrismaDatabase],
    },
    provideUseCase(SearchProductsUseCase, [ProductRepository]),
  ],
})
export class CatalogModule {}
