import { InMemoryProductRepository } from '../catalog/application/__tests__/in-memory-product.repository.js';
import { CreateProductUseCase } from '../catalog/application/use-cases/create-product.use-case.js';
import { FakePasswordHasher } from '../identity/application/__tests__/fake-password-hasher.js';
import { InMemoryUserRepository } from '../identity/application/__tests__/in-memory-user.repository.js';
import { InvalidEmailError } from '../identity/domain/invalid-email.error.js';
import { PromoteToOperatorUseCase } from '../identity/application/use-cases/promote-to-operator.use-case.js';
import { SignUpUseCase } from '../identity/application/use-cases/sign-up.use-case.js';
import { InMemoryStockItemRepository } from '../inventory/application/__tests__/in-memory-stock-item.repository.js';
import { ChangeMinimumLevelUseCase } from '../inventory/application/use-cases/change-minimum-level.use-case.js';
import { GetStockLevelUseCase } from '../inventory/application/use-cases/get-stock-level.use-case.js';
import { ReceiveStockUseCase } from '../inventory/application/use-cases/receive-stock.use-case.js';
import { InMemoryCouponRepository } from '../ordering/application/__tests__/in-memory-coupon.repository.js';
import { CreateCouponUseCase } from '../ordering/application/use-cases/create-coupon.use-case.js';
import { CouponCode } from '../ordering/domain/coupon/coupon-code.value-object.js';
import { DEMO_STORE } from './demo-store.js';
import { type Resolve, seedDemoStore } from './seed-demo-store.js';

describe('seedDemoStore', () => {
  let users: InMemoryUserRepository;
  let stockItems: InMemoryStockItemRepository;
  let coupons: InMemoryCouponRepository;
  let resolve: Resolve;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    const products = new InMemoryProductRepository();
    stockItems = new InMemoryStockItemRepository();
    coupons = new InMemoryCouponRepository();
    const services = new Map<unknown, unknown>([
      [SignUpUseCase, new SignUpUseCase(users, new FakePasswordHasher())],
      [PromoteToOperatorUseCase, new PromoteToOperatorUseCase(users)],
      [CreateProductUseCase, new CreateProductUseCase(products)],
      [ReceiveStockUseCase, new ReceiveStockUseCase(stockItems)],
      [ChangeMinimumLevelUseCase, new ChangeMinimumLevelUseCase(stockItems)],
      [CreateCouponUseCase, new CreateCouponUseCase(coupons)],
    ]);
    resolve = ((type: unknown) => services.get(type)) as Resolve;
  });

  const onHandOf = async (sku: string) =>
    (await new GetStockLevelUseCase(stockItems).execute({ sku })).onHand;

  it('should create the demo store in an empty database', async () => {
    const report = await seedDemoStore(resolve);

    expect(report.every((line) => line.endsWith('criado'))).toBe(true);
    const roles = users.all().map((user) => user.toSnapshot().role);
    expect(roles.sort()).toEqual(['CUSTOMER', 'CUSTOMER', 'OPERATOR']);
    for (const product of DEMO_STORE.products) {
      await expect(onHandOf(product.sku)).resolves.toBe(product.onHand);
    }
    await expect(
      coupons.findByCode(CouponCode.create('AGIL10')),
    ).resolves.not.toBeNull();
  });

  it('should change nothing when it runs again', async () => {
    await seedDemoStore(resolve);

    const report = await seedDemoStore(resolve);

    expect(report.every((line) => line.endsWith('já existia'))).toBe(true);
    expect(users.all()).toHaveLength(3);
    for (const product of DEMO_STORE.products) {
      await expect(onHandOf(product.sku)).resolves.toBe(product.onHand);
    }
  });

  it.each([
    ['an unexpected failure', new Error('o banco caiu')],
    [
      'a domain error that is not about existing data',
      new InvalidEmailError('x'),
    ],
  ])('should not hide %s', async (_, failure) => {
    const failing = (() => ({
      execute: () => Promise.reject(failure),
    })) as unknown as Resolve;

    await expect(seedDemoStore(failing)).rejects.toBe(failure);
  });
});
