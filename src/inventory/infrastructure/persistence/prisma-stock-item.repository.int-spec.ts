import { PrismaDatabase } from '../../../shared/infrastructure/database/prisma-database.js';
import { resetDatabase } from '../../../shared/infrastructure/database/__tests__/reset-database.js';
import { stockItemRepositoryContract } from '../../application/__tests__/stock-item-repository.contract.js';
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
});
