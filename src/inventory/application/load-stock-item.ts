import { Sku } from '../../shared/domain/sku.value-object.js';
import type { StockItem } from '../domain/stock-item.entity.js';
import { StockItemNotFoundError } from './errors/stock-item-not-found.error.js';
import type { StockItemRepository } from './ports/stock-item.repository.js';

export async function loadStockItem(
  stockItems: StockItemRepository,
  sku: string,
): Promise<StockItem> {
  const code = Sku.create(sku);
  const stockItem = await stockItems.findBySku(code);
  if (!stockItem) {
    throw new StockItemNotFoundError(code.toString());
  }
  return stockItem;
}
