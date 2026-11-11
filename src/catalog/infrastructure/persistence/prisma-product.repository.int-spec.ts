import { PrismaDatabase } from '../../../shared/infrastructure/database/prisma-database.js';
import { resetDatabase } from '../../../shared/infrastructure/database/__tests__/reset-database.js';
import { productRepositoryContract } from '../../application/__tests__/product-repository.contract.js';
import { PrismaProductRepository } from './prisma-product.repository.js';

describe('PrismaProductRepository', () => {
  const database = new PrismaDatabase(process.env.DATABASE_URL ?? '');

  afterAll(async () => {
    await database.disconnect();
  });

  productRepositoryContract(async () => {
    await resetDatabase(database);
    return new PrismaProductRepository(database);
  });
});
