import { Sku } from '../../../shared/domain/sku.value-object.js';
import { aStockItem } from '../../domain/__tests__/stock-item.builder.js';
import { movementSearchParams } from '../movement-search.js';
import { InMemoryStockItemRepository } from '../__tests__/in-memory-stock-item.repository.js';
import { ReceiveStockUseCase } from './receive-stock.use-case.js';

describe('ReceiveStockUseCase', () => {
  let stockItems: InMemoryStockItemRepository;
  let receiveStock: ReceiveStockUseCase;

  beforeEach(() => {
    stockItems = new InMemoryStockItemRepository();
    receiveStock = new ReceiveStockUseCase(stockItems);
  });

  it('should create the stock item on the first receipt', async () => {
    const output = await receiveStock.execute({ sku: 'can001', quantity: 30 });

    expect(output).toEqual({
      sku: 'CAN001',
      onHand: 30,
      reserved: 0,
      available: 30,
      minimumLevel: 0,
      belowMinimum: false,
    });
  });

  it('should add to an existing stock item and record the movement', async () => {
    await stockItems.save(
      aStockItem().withSku('CAN001').withOnHand(10).withReserved(4).build(),
    );

    const output = await receiveStock.execute({ sku: 'CAN001', quantity: 5 });

    expect(output).toMatchObject({ onHand: 15, reserved: 4, available: 11 });
    const movements = await stockItems.findMovements(
      Sku.create('CAN001'),
      movementSearchParams({}),
    );
    expect(movements.toOutput().total).toBe(1);
  });

  it.each([
    ['zero units', 0, 'EMPTY_STOCK_MOVEMENT'],
    ['a negative quantity', -3, 'INVALID_STOCK_QUANTITY'],
  ])(
    'should store nothing when receiving %s',
    async (_case, quantity, code) => {
      await expect(
        receiveStock.execute({ sku: 'CAN001', quantity }),
      ).rejects.toThrow(expect.objectContaining({ code }));

      expect(await stockItems.findBySku(Sku.create('CAN001'))).toBeNull();
    },
  );
});
