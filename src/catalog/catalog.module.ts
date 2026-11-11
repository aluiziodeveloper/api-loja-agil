import { Module } from '@nestjs/common';
import { PrismaDatabase } from '../shared/infrastructure/database/prisma-database.js';
import { provideUseCase } from '../shared/infrastructure/nest/provide-use-case.js';
import { ProductRepository } from './application/ports/product.repository.js';
import { ActivateProductUseCase } from './application/use-cases/activate-product.use-case.js';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case.js';
import { DeactivateProductUseCase } from './application/use-cases/deactivate-product.use-case.js';
import { GetProductUseCase } from './application/use-cases/get-product.use-case.js';
import { SearchProductsUseCase } from './application/use-cases/search-products.use-case.js';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case.js';
import { ActivateProductController } from './infrastructure/http/activate-product.controller.js';
import { CreateProductController } from './infrastructure/http/create-product.controller.js';
import { DeactivateProductController } from './infrastructure/http/deactivate-product.controller.js';
import { GetProductController } from './infrastructure/http/get-product.controller.js';
import { SearchProductsController } from './infrastructure/http/search-products.controller.js';
import { UpdateProductController } from './infrastructure/http/update-product.controller.js';
import { PrismaProductRepository } from './infrastructure/persistence/prisma-product.repository.js';

@Module({
  controllers: [
    CreateProductController,
    SearchProductsController,
    GetProductController,
    UpdateProductController,
    ActivateProductController,
    DeactivateProductController,
  ],
  providers: [
    {
      provide: ProductRepository,
      useFactory: (database: PrismaDatabase) =>
        new PrismaProductRepository(database),
      inject: [PrismaDatabase],
    },
    provideUseCase(CreateProductUseCase, [ProductRepository]),
    provideUseCase(SearchProductsUseCase, [ProductRepository]),
    provideUseCase(GetProductUseCase, [ProductRepository]),
    provideUseCase(UpdateProductUseCase, [ProductRepository]),
    provideUseCase(ActivateProductUseCase, [ProductRepository]),
    provideUseCase(DeactivateProductUseCase, [ProductRepository]),
  ],
})
export class CatalogModule {}
