import { Sku } from '../../../shared/domain/sku.value-object.js';
import { aStockItem } from '../../domain/__tests__/stock-item.builder.js';
import { StockItemNotFoundError } from '../errors/stock-item-not-found.error.js';
import { InMemoryStockItemRepository } from '../__tests__/in-memory-stock-item.repository.js';
import { AdjustStockUseCase } from './adjust-stock.use-case.js';

describe('AdjustStockUseCase', () => {
  let stockItems: InMemoryStockItemRepository;
  let adjustStock: AdjustStockUseCase;

  beforeEach(async () => {
    stockItems = new InMemoryStockItemRepository();
    adjustStock = new AdjustStockUseCase(stockItems);
    await stockItems.save(
      aStockItem()
        .withSku('CAN001')
        .withOnHand(20)
        .withReserved(8)
        .withMinimumLevel(5)
        .build(),
    );
  });

  it('should set the counted units', async () => {
    const output = await adjustStock.execute({
      sku: 'CAN001',
      countedQuantity: 17,
      reason: 'Contagem mensal',
    });

    expect(output).toMatchObject({ onHand: 17, reserved: 8, available: 9 });
    const stored = await stockItems.findBySku(Sku.create('CAN001'));
    expect(stored?.toSnapshot().onHand).toBe(17);
  });

  it('should refuse a count below the reserved units', async () => {
    await expect(
      adjustStock.execute({
        sku: 'CAN001',
        countedQuantity: 7,
        reason: 'Avaria',
      }),
    ).rejects.toThrow(
      expect.objectContaining({ code: 'STOCK_BELOW_RESERVED' }),
    );
  });

  it('should require a reason', async () => {
    await expect(
      adjustStock.execute({ sku: 'CAN001', countedQuantity: 17, reason: ' ' }),
    ).rejects.toThrow(
      expect.objectContaining({ code: 'MISSING_ADJUSTMENT_REASON' }),
    );
  });

  it('should reject an unknown SKU', async () => {
    const result = adjustStock.execute({
      sku: 'NADA01',
      countedQuantity: 1,
      reason: 'Contagem mensal',
    });

    await expect(result).rejects.toThrow(StockItemNotFoundError);
    await expect(result).rejects.toMatchObject({
      code: 'STOCK_ITEM_NOT_FOUND',
      message: 'Não há estoque registrado para o SKU "NADA01".',
    });
  });
});
