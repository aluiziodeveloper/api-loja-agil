import { aStockItem } from '../../domain/__tests__/stock-item.builder.js';
import { StockItemNotFoundError } from '../errors/stock-item-not-found.error.js';
import { InMemoryStockItemRepository } from '../__tests__/in-memory-stock-item.repository.js';
import { GetStockLevelUseCase } from './get-stock-level.use-case.js';

describe('GetStockLevelUseCase', () => {
  let stockItems: InMemoryStockItemRepository;
  let getStockLevel: GetStockLevelUseCase;

  beforeEach(() => {
    stockItems = new InMemoryStockItemRepository();
    getStockLevel = new GetStockLevelUseCase(stockItems);
  });

  it('should return the stock level of a SKU', async () => {
    await stockItems.save(
      aStockItem()
        .withSku('CAN001')
        .withOnHand(20)
        .withReserved(16)
        .withMinimumLevel(5)
        .build(),
    );

    const output = await getStockLevel.execute({ sku: 'can001' });

    expect(output).toEqual({
      sku: 'CAN001',
      onHand: 20,
      reserved: 16,
      available: 4,
      minimumLevel: 5,
      belowMinimum: true,
    });
  });

  it('should reject an unknown SKU', async () => {
    await expect(getStockLevel.execute({ sku: 'NADA01' })).rejects.toThrow(
      StockItemNotFoundError,
    );
  });
});
