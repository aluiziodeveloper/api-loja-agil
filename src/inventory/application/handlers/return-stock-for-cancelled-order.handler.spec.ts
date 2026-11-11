import { Sku } from '../../../shared/domain/sku.value-object.js';
import { aStockItem } from '../../domain/__tests__/stock-item.builder.js';
import { InMemoryStockItemRepository } from '../__tests__/in-memory-stock-item.repository.js';
import { orderCancelledMessage } from '../__tests__/order-message.js';
import { ReturnStockForCancelledOrderHandler } from './return-stock-for-cancelled-order.handler.js';

describe('ReturnStockForCancelledOrderHandler', () => {
  let stockItems: InMemoryStockItemRepository;
  let handler: ReturnStockForCancelledOrderHandler;

  beforeEach(async () => {
    stockItems = new InMemoryStockItemRepository();
    handler = new ReturnStockForCancelledOrderHandler(stockItems);
    await stockItems.save(
      aStockItem().withSku('CAN001').withOnHand(6).withReserved(4).build(),
    );
  });

  it.each([
    {
      previousStatus: 'PLACED',
      onHand: 6,
      reserved: 1,
      undo: 'release the reservation',
    },
    {
      previousStatus: 'PAID',
      onHand: 9,
      reserved: 4,
      undo: 'put the units back',
    },
    { previousStatus: 'DRAFT', onHand: 6, reserved: 4, undo: 'change nothing' },
  ])(
    'should $undo when the order was $previousStatus',
    async ({ previousStatus, onHand, reserved }) => {
      await handler.handle(
        orderCancelledMessage([{ sku: 'CAN001', quantity: 3 }], previousStatus),
      );

      const stored = await stockItems.findBySku(Sku.create('CAN001'));
      expect(stored?.toSnapshot()).toMatchObject({ onHand, reserved });
    },
  );
});
