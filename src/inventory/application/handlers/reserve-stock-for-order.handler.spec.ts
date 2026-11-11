import { Sku } from '../../../shared/domain/sku.value-object.js';
import { aStockItem } from '../../domain/__tests__/stock-item.builder.js';
import type { StockItemSnapshot } from '../../domain/stock-item.snapshot.js';
import { StockShortageError } from '../errors/stock-shortage.error.js';
import { InMemoryStockItemRepository } from '../__tests__/in-memory-stock-item.repository.js';
import { orderMessage } from '../__tests__/order-message.js';
import { ReserveStockForOrderHandler } from './reserve-stock-for-order.handler.js';

describe('ReserveStockForOrderHandler', () => {
  let stockItems: InMemoryStockItemRepository;
  let handler: ReserveStockForOrderHandler;

  beforeEach(async () => {
    stockItems = new InMemoryStockItemRepository();
    handler = new ReserveStockForOrderHandler(stockItems);
    await stockItems.save(
      aStockItem().withSku('CAN001').withOnHand(10).build(),
    );
    await stockItems.save(
      aStockItem().withSku('CAM001').withOnHand(3).withReserved(2).build(),
    );
  });

  async function stockOf(sku: string): Promise<StockItemSnapshot | undefined> {
    return (await stockItems.findBySku(Sku.create(sku)))?.toSnapshot();
  }

  it('should reserve every item of the order', async () => {
    await handler.handle(
      orderMessage('OrderPlaced', [
        { sku: 'CAN001', quantity: 4 },
        { sku: 'CAM001', quantity: 1 },
      ]),
    );

    expect(await stockOf('CAN001')).toMatchObject({ onHand: 10, reserved: 4 });
    expect(await stockOf('CAM001')).toMatchObject({ onHand: 3, reserved: 3 });
  });

  it('should reserve nothing when any item is short (RN12)', async () => {
    const order = orderMessage('OrderPlaced', [
      { sku: 'CAN001', quantity: 4 },
      { sku: 'CAM001', quantity: 2 },
    ]);

    await expect(handler.handle(order)).rejects.toThrow(StockShortageError);
    expect((await stockOf('CAN001'))?.reserved).toBe(0);
    expect((await stockOf('CAM001'))?.reserved).toBe(2);
  });

  it('should report every shortage at once, unknown SKUs included', async () => {
    const order = orderMessage('OrderPlaced', [
      { sku: 'CAN001', quantity: 4 },
      { sku: 'CAM001', quantity: 2 },
      { sku: 'BON001', quantity: 1 },
    ]);

    await expect(handler.handle(order)).rejects.toMatchObject({
      code: 'STOCK_SHORTAGE',
      message:
        'Estoque insuficiente: CAM001 (solicitado 2, disponível 1); BON001 (solicitado 1, disponível 0).',
      shortages: [
        { sku: 'CAM001', requested: 2, available: 1 },
        { sku: 'BON001', requested: 1, available: 0 },
      ],
    });
  });
});
