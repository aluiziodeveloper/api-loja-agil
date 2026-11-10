import { anOrder } from '../../domain/__tests__/order.builder.js';
import { InMemoryOrderRepository } from '../__tests__/in-memory-order.repository.js';
import { InMemoryProductCatalog } from '../__tests__/in-memory-product-catalog.js';
import { AddOrderItemUseCase } from './add-order-item.use-case.js';

const ORDER_ID = '01890a5d-ac96-774b-bcce-b302099a8058';

describe('AddOrderItemUseCase', () => {
  let orders: InMemoryOrderRepository;
  let catalog: InMemoryProductCatalog;
  let addItem: AddOrderItemUseCase;

  beforeEach(async () => {
    orders = new InMemoryOrderRepository();
    catalog = new InMemoryProductCatalog();
    addItem = new AddOrderItemUseCase(orders, catalog);
    catalog.register({ sku: 'CAN001', priceInCents: 4990 });
    await orders.save(anOrder().withId(ORDER_ID).withItems().build());
  });

  it('should add the product with the current catalog price (RN10)', async () => {
    const output = await addItem.execute({
      orderId: ORDER_ID,
      sku: 'can001',
      quantity: 2,
    });

    expect(output.items).toEqual([
      {
        sku: 'CAN001',
        unitPriceInCents: 4990,
        quantity: 2,
        subtotalInCents: 9980,
      },
    ]);
    expect(output.totalInCents).toBe(9980);
  });

  it('should keep the frozen price when the catalog price changes', async () => {
    await addItem.execute({ orderId: ORDER_ID, sku: 'CAN001', quantity: 1 });
    catalog.register({ sku: 'CAN001', priceInCents: 5990 });

    const output = await addItem.execute({
      orderId: ORDER_ID,
      sku: 'CAN001',
      quantity: 1,
    });

    expect(output.items).toEqual([
      {
        sku: 'CAN001',
        unitPriceInCents: 4990,
        quantity: 2,
        subtotalInCents: 9980,
      },
    ]);
  });

  it.each([
    ['an inactive product (RN06)', 'CAM001', false],
    ['a product missing from the catalog', 'NADA01', true],
  ])('should refuse %s', async (_case, sku, active) => {
    catalog.register({ sku: 'CAM001', priceInCents: 7990, active });

    await expect(
      addItem.execute({ orderId: ORDER_ID, sku, quantity: 1 }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'PRODUCT_UNAVAILABLE',
        message: `O produto "${sku}" não está disponível para venda.`,
      }),
    );
  });

  it('should reject an unknown order', async () => {
    await expect(
      addItem.execute({
        orderId: '01890a5d-ac96-774b-bcce-b302099a8099',
        sku: 'CAN001',
        quantity: 1,
      }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'ORDER_NOT_FOUND',
        message:
          'Pedido "01890a5d-ac96-774b-bcce-b302099a8099" não encontrado.',
      }),
    );
  });
});
