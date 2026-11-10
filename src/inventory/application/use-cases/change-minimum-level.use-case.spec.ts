import { aStockItem } from '../../domain/__tests__/stock-item.builder.js';
import { StockItemNotFoundError } from '../errors/stock-item-not-found.error.js';
import { InMemoryStockItemRepository } from '../__tests__/in-memory-stock-item.repository.js';
import { ChangeMinimumLevelUseCase } from './change-minimum-level.use-case.js';

describe('ChangeMinimumLevelUseCase', () => {
  let stockItems: InMemoryStockItemRepository;
  let changeMinimumLevel: ChangeMinimumLevelUseCase;

  beforeEach(async () => {
    stockItems = new InMemoryStockItemRepository();
    changeMinimumLevel = new ChangeMinimumLevelUseCase(stockItems);
    await stockItems.save(
      aStockItem().withSku('CAN001').withOnHand(10).withMinimumLevel(2).build(),
    );
  });

  it('should change the minimum level and report the stock as low', async () => {
    const output = await changeMinimumLevel.execute({
      sku: 'CAN001',
      minimumLevel: 15,
    });

    expect(output).toMatchObject({ minimumLevel: 15, belowMinimum: true });
  });

  it('should reject an unknown SKU', async () => {
    await expect(
      changeMinimumLevel.execute({ sku: 'NADA01', minimumLevel: 1 }),
    ).rejects.toThrow(StockItemNotFoundError);
  });
});
