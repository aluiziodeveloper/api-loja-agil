import type { SearchResult } from '../../../shared/application/search/search-result.js';
import type { Sku } from '../../../shared/domain/sku.value-object.js';
import type { StockItem } from '../../domain/stock-item.entity.js';
import type { StockMovement } from '../../domain/stock-movement.js';
import type { MovementSearchParams } from '../movement-search.js';

export interface StockItemRepository {
  /** Grava o estado e acrescenta ao histórico os movimentos pendentes do item. */
  save(stockItem: StockItem): Promise<void>;
  findBySku(sku: Sku): Promise<StockItem | null>;
  findMovements(
    sku: Sku,
    params: MovementSearchParams,
  ): Promise<SearchResult<StockMovement>>;
}
