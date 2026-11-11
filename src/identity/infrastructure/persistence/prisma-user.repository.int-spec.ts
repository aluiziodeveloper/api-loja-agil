import { PrismaDatabase } from '../../../shared/infrastructure/database/prisma-database.js';
import { resetDatabase } from '../../../shared/infrastructure/database/__tests__/reset-database.js';
import { userRepositoryContract } from '../../application/__tests__/user-repository.contract.js';
import { PrismaUserRepository } from './prisma-user.repository.js';

describe('PrismaUserRepository', () => {
  const database = new PrismaDatabase(process.env.DATABASE_URL ?? '');

  afterAll(async () => {
    await database.disconnect();
  });

  userRepositoryContract(async () => {
    await resetDatabase(database);
    return new PrismaUserRepository(database);
  });
});
