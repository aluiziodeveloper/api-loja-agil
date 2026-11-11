import { PrismaDatabase } from '../../../shared/infrastructure/database/prisma-database.js';
import { resetDatabase } from '../../../shared/infrastructure/database/__tests__/reset-database.js';
import { couponRepositoryContract } from '../../application/__tests__/coupon-repository.contract.js';
import { PrismaCouponRepository } from './prisma-coupon.repository.js';

describe('PrismaCouponRepository', () => {
  const database = new PrismaDatabase(process.env.DATABASE_URL ?? '');

  afterAll(async () => {
    await database.disconnect();
  });

  couponRepositoryContract(async () => {
    await resetDatabase(database);
    return new PrismaCouponRepository(database);
  });
});
