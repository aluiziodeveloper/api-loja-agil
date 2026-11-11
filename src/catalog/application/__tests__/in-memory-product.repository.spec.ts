import { InMemoryProductRepository } from './in-memory-product.repository.js';
import { productRepositoryContract } from './product-repository.contract.js';

describe('InMemoryProductRepository', () => {
  productRepositoryContract(async () => new InMemoryProductRepository());
});
