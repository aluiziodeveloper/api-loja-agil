import { couponRepositoryContract } from './coupon-repository.contract.js';
import { InMemoryCouponRepository } from './in-memory-coupon.repository.js';

describe('InMemoryCouponRepository', () => {
  couponRepositoryContract(async () => new InMemoryCouponRepository());
});
