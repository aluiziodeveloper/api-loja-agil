import { Module } from '@nestjs/common';
import { PrismaDatabase } from '../shared/infrastructure/database/prisma-database.js';
import { provideUseCase } from '../shared/infrastructure/nest/provide-use-case.js';
import { StockItemRepository } from './application/ports/stock-item.repository.js';
import { AdjustStockUseCase } from './application/use-cases/adjust-stock.use-case.js';
import { ChangeMinimumLevelUseCase } from './application/use-cases/change-minimum-level.use-case.js';
import { GetStockLevelUseCase } from './application/use-cases/get-stock-level.use-case.js';
import { ListStockMovementsUseCase } from './application/use-cases/list-stock-movements.use-case.js';
import { ReceiveStockUseCase } from './application/use-cases/receive-stock.use-case.js';
import { AdjustStockController } from './infrastructure/http/adjust-stock.controller.js';
import { ChangeMinimumLevelController } from './infrastructure/http/change-minimum-level.controller.js';
import { GetStockLevelController } from './infrastructure/http/get-stock-level.controller.js';
import { ListStockMovementsController } from './infrastructure/http/list-stock-movements.controller.js';
import { ReceiveStockController } from './infrastructure/http/receive-stock.controller.js';
import { PrismaStockItemRepository } from './infrastructure/persistence/prisma-stock-item.repository.js';

@Module({
  controllers: [
    GetStockLevelController,
    ReceiveStockController,
    AdjustStockController,
    ChangeMinimumLevelController,
    ListStockMovementsController,
  ],
  providers: [
    {
      provide: StockItemRepository,
      useFactory: (database: PrismaDatabase) =>
        new PrismaStockItemRepository(database),
      inject: [PrismaDatabase],
    },
    provideUseCase(GetStockLevelUseCase, [StockItemRepository]),
    provideUseCase(ReceiveStockUseCase, [StockItemRepository]),
    provideUseCase(AdjustStockUseCase, [StockItemRepository]),
    provideUseCase(ChangeMinimumLevelUseCase, [StockItemRepository]),
    provideUseCase(ListStockMovementsUseCase, [StockItemRepository]),
  ],
  // A camada de integração precisa do repositório para ligar os contextos.
  exports: [StockItemRepository],
})
export class InventoryModule {}
