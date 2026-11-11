import { InMemoryUserRepository } from './in-memory-user.repository.js';
import { userRepositoryContract } from './user-repository.contract.js';

describe('InMemoryUserRepository', () => {
  userRepositoryContract(async () => new InMemoryUserRepository());
});
