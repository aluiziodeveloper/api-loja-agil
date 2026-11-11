import { ConcurrentUpdateError } from '../../../shared/application/concurrent-update.error.js';
import { Sku } from '../../../shared/domain/sku.value-object.js';
import { PrismaDatabase } from '../../../shared/infrastructure/database/prisma-database.js';
import { resetDatabase } from '../../../shared/infrastructure/database/__tests__/reset-database.js';
import { stockItemRepositoryContract } from '../../application/__tests__/stock-item-repository.contract.js';
import { StockItem } from '../../domain/stock-item.entity.js';
import { StockQuantity } from '../../domain/stock-quantity.value-object.js';
import { PrismaStockItemRepository } from './prisma-stock-item.repository.js';

describe('PrismaStockItemRepository', () => {
  const database = new PrismaDatabase(process.env.DATABASE_URL ?? '');

  afterAll(async () => {
    await database.disconnect();
  });

  stockItemRepositoryContract(async () => {
    await resetDatabase(database);
    return new PrismaStockItemRepository(database);
  });

  it('should not disguise an error that is not a conflict', async () => {
    const offline = new PrismaDatabase(
      'postgresql://loja:loja@db:1/fora_do_ar',
    );
    const stockItems = new PrismaStockItemRepository(offline);
    const stock = StockItem.create(Sku.create('CAN001'), StockQuantity.zero());

    const failure = await stockItems
      .save(stock)
      .catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(Error);
    expect(failure).not.toBeInstanceOf(ConcurrentUpdateError);
    await offline.disconnect();
  });
});
