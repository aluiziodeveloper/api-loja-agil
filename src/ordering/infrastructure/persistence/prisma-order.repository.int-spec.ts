import { PrismaDatabase } from '../../../shared/infrastructure/database/prisma-database.js';
import { resetDatabase } from '../../../shared/infrastructure/database/__tests__/reset-database.js';
import { orderRepositoryContract } from '../../application/__tests__/order-repository.contract.js';
import { PrismaOrderRepository } from './prisma-order.repository.js';

describe('PrismaOrderRepository', () => {
  const database = new PrismaDatabase(process.env.DATABASE_URL ?? '');

  afterAll(async () => {
    await database.disconnect();
  });

  orderRepositoryContract(async () => {
    await resetDatabase(database);
    return new PrismaOrderRepository(database);
  });
});
