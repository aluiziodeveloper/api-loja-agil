import type { StockItem } from '../../domain/stock-item.entity.js';
import { StockQuantity } from '../../domain/stock-quantity.value-object.js';
import { loadStockItem } from '../load-stock-item.js';
import type { OrderLine } from '../order-messages.js';
import type { StockItemRepository } from '../ports/stock-item.repository.js';

export type StockChange = (
  stockItem: StockItem,
  quantity: StockQuantity,
) => void;

/** Para cada linha do pedido: carrega o item, aplica a mudança e grava. */
export async function changeStockLines(
  stockItems: StockItemRepository,
  lines: OrderLine[],
  change: StockChange,
): Promise<void> {
  for (const line of lines) {
    const stockItem = await loadStockItem(stockItems, line.sku);
    change(stockItem, StockQuantity.of(line.quantity));
    await stockItems.save(stockItem);
  }
}
