import { Sku } from '../../../shared/domain/sku.value-object.js';
import { aStockItem } from '../../domain/__tests__/stock-item.builder.js';
import { InMemoryStockItemRepository } from '../__tests__/in-memory-stock-item.repository.js';
import { orderMessage } from '../__tests__/order-message.js';
import { CommitStockForOrderHandler } from './commit-stock-for-order.handler.js';

describe('CommitStockForOrderHandler', () => {
  let stockItems: InMemoryStockItemRepository;
  let handler: CommitStockForOrderHandler;

  beforeEach(async () => {
    stockItems = new InMemoryStockItemRepository();
    handler = new CommitStockForOrderHandler(stockItems);
    await stockItems.save(
      aStockItem().withSku('CAN001').withOnHand(10).withReserved(4).build(),
    );
  });

  it('should turn the reservation into a write-off (RN13)', async () => {
    await handler.handle(
      orderMessage('OrderPaid', [{ sku: 'CAN001', quantity: 4 }]),
    );

    const stored = await stockItems.findBySku(Sku.create('CAN001'));
    expect(stored?.toSnapshot()).toMatchObject({ onHand: 6, reserved: 0 });
  });

  it('should refuse an item without stock', async () => {
    await expect(
      handler.handle(
        orderMessage('OrderPaid', [{ sku: 'BON001', quantity: 1 }]),
      ),
    ).rejects.toThrow(
      expect.objectContaining({ code: 'STOCK_ITEM_NOT_FOUND' }),
    );
  });
});
