import { InMemoryProductRepository } from '../catalog/application/__tests__/in-memory-product.repository.js';
import { aProduct } from '../catalog/domain/__tests__/product.builder.js';
import { InMemoryStockItemRepository } from '../inventory/application/__tests__/in-memory-stock-item.repository.js';
import { GetStockLevelUseCase } from '../inventory/application/use-cases/get-stock-level.use-case.js';
import { aStockItem } from '../inventory/domain/__tests__/stock-item.builder.js';
import { InMemoryOrderRepository } from '../ordering/application/__tests__/in-memory-order.repository.js';
import type { OrderLifecycleDeps } from '../ordering/application/transition-order.js';
import { AddOrderItemUseCase } from '../ordering/application/use-cases/add-order-item.use-case.js';
import { CancelOrderUseCase } from '../ordering/application/use-cases/cancel-order.use-case.js';
import { CreateDraftOrderUseCase } from '../ordering/application/use-cases/create-draft-order.use-case.js';
import { GetOrderUseCase } from '../ordering/application/use-cases/get-order.use-case.js';
import { PayOrderUseCase } from '../ordering/application/use-cases/pay-order.use-case.js';
import { PlaceOrderUseCase } from '../ordering/application/use-cases/place-order.use-case.js';
import { EventDispatcher } from '../shared/application/events/event-dispatcher.js';
import { InMemoryTransaction } from '../shared/application/__tests__/in-memory-transaction.js';
import { connectInventoryToOrders } from './connect-inventory-to-orders.js';
import { ProductCatalogAdapter } from './product-catalog.adapter.js';

const CUSTOMER_ID = '01890a5d-ac96-774b-bcce-b302099a8057';

/** Pedidos, Estoque e Catálogo ligados como na aplicação, só que em memória. */
describe('order fulfillment', () => {
  let stockItems: InMemoryStockItemRepository;
  let orders: InMemoryOrderRepository;
  let deps: OrderLifecycleDeps;
  let addItem: AddOrderItemUseCase;

  beforeEach(async () => {
    const products = new InMemoryProductRepository();
    const events = new EventDispatcher();
    stockItems = new InMemoryStockItemRepository();
    orders = new InMemoryOrderRepository();
    deps = {
      orders,
      events,
      transaction: new InMemoryTransaction([orders, stockItems]),
    };
    addItem = new AddOrderItemUseCase(
      orders,
      new ProductCatalogAdapter(products),
    );
    connectInventoryToOrders(events, stockItems);

    for (const sku of ['CAN001', 'CAM001']) {
      await products.save(aProduct().withSku(sku).build());
    }
    await stockItems.save(
      aStockItem().withSku('CAN001').withOnHand(10).build(),
    );
    await stockItems.save(aStockItem().withSku('CAM001').withOnHand(1).build());
  });

  async function draftWith(mugs: number, shirts: number): Promise<string> {
    const draft = await new CreateDraftOrderUseCase(orders).execute({
      customerId: CUSTOMER_ID,
    });
    await addItem.execute({ orderId: draft.id, sku: 'CAN001', quantity: mugs });
    await addItem.execute({
      orderId: draft.id,
      sku: 'CAM001',
      quantity: shirts,
    });
    return draft.id;
  }

  async function stockOf(sku: string): Promise<object> {
    const { onHand, reserved } = await new GetStockLevelUseCase(
      stockItems,
    ).execute({ sku });
    return { onHand, reserved };
  }

  it('should reserve the stock when the order is placed and write it off when paid', async () => {
    const orderId = await draftWith(3, 1);

    await new PlaceOrderUseCase(deps).execute({ orderId });
    expect(await stockOf('CAN001')).toEqual({ onHand: 10, reserved: 3 });
    expect(await stockOf('CAM001')).toEqual({ onHand: 1, reserved: 1 });

    await new PayOrderUseCase(deps).execute({ orderId });
    expect(await stockOf('CAN001')).toEqual({ onHand: 7, reserved: 0 });
    expect(await stockOf('CAM001')).toEqual({ onHand: 0, reserved: 0 });
  });

  it('should keep the order as a draft and reserve nothing when an item is short (RN12)', async () => {
    const orderId = await draftWith(3, 2);

    await expect(
      new PlaceOrderUseCase(deps).execute({ orderId }),
    ).rejects.toMatchObject({
      code: 'STOCK_SHORTAGE',
      message: 'Estoque insuficiente: CAM001 (solicitado 2, disponível 1).',
    });

    const order = await new GetOrderUseCase(orders).execute({ orderId });
    expect(order.status).toBe('DRAFT');
    expect(await stockOf('CAN001')).toEqual({ onHand: 10, reserved: 0 });
  });

  it('should release the reservation when a placed order is cancelled (RN13)', async () => {
    const orderId = await draftWith(3, 1);
    await new PlaceOrderUseCase(deps).execute({ orderId });

    await new CancelOrderUseCase(deps).execute({ orderId });

    expect(await stockOf('CAN001')).toEqual({ onHand: 10, reserved: 0 });
    expect(await stockOf('CAM001')).toEqual({ onHand: 1, reserved: 0 });
  });

  it('should put the units back when a paid order is cancelled (RN13)', async () => {
    const orderId = await draftWith(3, 1);
    await new PlaceOrderUseCase(deps).execute({ orderId });
    await new PayOrderUseCase(deps).execute({ orderId });

    await new CancelOrderUseCase(deps).execute({ orderId });

    expect(await stockOf('CAN001')).toEqual({ onHand: 10, reserved: 0 });
    expect(await stockOf('CAM001')).toEqual({ onHand: 1, reserved: 0 });
  });
});
