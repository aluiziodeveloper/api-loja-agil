import { aProduct } from '../catalog/domain/__tests__/product.builder.js';
import { PrismaProductRepository } from '../catalog/infrastructure/persistence/prisma-product.repository.js';
import { movementSearchParams } from '../inventory/application/movement-search.js';
import { aStockItem } from '../inventory/domain/__tests__/stock-item.builder.js';
import { PrismaStockItemRepository } from '../inventory/infrastructure/persistence/prisma-stock-item.repository.js';
import type { OrderLifecycleDeps } from '../ordering/application/transition-order.js';
import { AddOrderItemUseCase } from '../ordering/application/use-cases/add-order-item.use-case.js';
import type { CustomerOrderRef } from '../ordering/application/load-order.js';
import { CreateDraftOrderUseCase } from '../ordering/application/use-cases/create-draft-order.use-case.js';
import { GetOrderUseCase } from '../ordering/application/use-cases/get-order.use-case.js';
import { PlaceOrderUseCase } from '../ordering/application/use-cases/place-order.use-case.js';
import { PrismaOrderRepository } from '../ordering/infrastructure/persistence/prisma-order.repository.js';
import { EventDispatcher } from '../shared/application/events/event-dispatcher.js';
import { Sku } from '../shared/domain/sku.value-object.js';
import { PrismaDatabase } from '../shared/infrastructure/database/prisma-database.js';
import { resetDatabase } from '../shared/infrastructure/database/__tests__/reset-database.js';
import { connectInventoryToOrders } from './connect-inventory-to-orders.js';
import { ProductCatalogAdapter } from './product-catalog.adapter.js';

const CUSTOMER_ID = '01890a5d-ac96-774b-bcce-b302099a8057';
const OTHER_CUSTOMER_ID = '01890a5d-ac96-774b-bcce-b302099a8059';

/** O mesmo fluxo do teste em memória, agora com o Postgres e transações reais. */
describe('order fulfillment on the database', () => {
  const database = new PrismaDatabase(process.env.DATABASE_URL ?? '');
  const stockItems = new PrismaStockItemRepository(database);
  const orders = new PrismaOrderRepository(database);
  const products = new PrismaProductRepository(database);
  const addItem = new AddOrderItemUseCase(
    orders,
    new ProductCatalogAdapter(products),
  );
  let events: EventDispatcher;
  let deps: OrderLifecycleDeps;

  beforeEach(async () => {
    await resetDatabase(database);
    events = new EventDispatcher();
    deps = { orders, events, transaction: database };
    connectInventoryToOrders(events, stockItems);
    for (const sku of ['CAN001', 'CAM001']) {
      await products.save(aProduct().withSku(sku).build());
    }
    await stockItems.save(
      aStockItem().withSku('CAN001').withOnHand(10).build(),
    );
    await stockItems.save(aStockItem().withSku('CAM001').withOnHand(1).build());
  });

  afterAll(async () => {
    await database.disconnect();
  });

  async function draftWith(
    lines: [string, number][],
    customerId = CUSTOMER_ID,
  ): Promise<CustomerOrderRef> {
    const draft = await new CreateDraftOrderUseCase(orders).execute({
      customerId,
    });
    for (const [sku, quantity] of lines) {
      await addItem.execute({ orderId: draft.id, customerId, sku, quantity });
    }
    return { orderId: draft.id, customerId };
  }

  async function statusOf(order: CustomerOrderRef): Promise<string> {
    return (await new GetOrderUseCase(orders).execute(order)).status;
  }

  async function reservedOf(sku: string): Promise<number | undefined> {
    return (await stockItems.findBySku(Sku.create(sku)))?.toSnapshot().reserved;
  }

  async function historySize(sku: string): Promise<number> {
    const history = await stockItems.findMovements(
      Sku.create(sku),
      movementSearchParams({}),
    );
    return history.toOutput().total;
  }

  it('should keep the order as a draft and write nothing when an item is short (RN12)', async () => {
    const order = await draftWith([
      ['CAN001', 3],
      ['CAM001', 2],
    ]);

    await expect(
      new PlaceOrderUseCase(deps).execute(order),
    ).rejects.toMatchObject({
      code: 'STOCK_SHORTAGE',
    });

    expect(await statusOf(order)).toBe('DRAFT');
    expect(await reservedOf('CAN001')).toBe(0);
    expect(await historySize('CAN001')).toBe(0);
  });

  it('should undo the reservations when something after them fails', async () => {
    const order = await draftWith([['CAN001', 3]]);
    const failure = new Error('o e-mail de confirmação falhou');
    events.subscribe('OrderPlaced', {
      handle: async () => Promise.reject(failure),
    });

    await expect(new PlaceOrderUseCase(deps).execute(order)).rejects.toBe(
      failure,
    );

    expect(await statusOf(order)).toBe('DRAFT');
    expect(await reservedOf('CAN001')).toBe(0);
    expect(await historySize('CAN001')).toBe(0);
  });

  it('should sell the last unit only once when two customers place at the same time', async () => {
    const first = await draftWith([['CAM001', 1]]);
    const second = await draftWith([['CAM001', 1]], OTHER_CUSTOMER_ID);

    const results = await Promise.allSettled([
      new PlaceOrderUseCase(deps).execute(first),
      new PlaceOrderUseCase(deps).execute(second),
    ]);

    const statuses = results.map((result) => result.status).sort();
    expect(statuses).toEqual(['fulfilled', 'rejected']);
    const [loser] = results.filter((result) => result.status === 'rejected');
    expect(['STOCK_SHORTAGE', 'CONCURRENT_UPDATE']).toContain(
      (loser?.reason as { code?: string } | undefined)?.code,
    );
    expect(await reservedOf('CAM001')).toBe(1);
    expect([await statusOf(first), await statusOf(second)].sort()).toEqual([
      'DRAFT',
      'PLACED',
    ]);
  });
});
