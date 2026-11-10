import { SortDirection } from '../../../shared/application/search/search-params.js';
import type { SearchResult } from '../../../shared/application/search/search-result.js';
import { paginate } from '../../../shared/application/__tests__/paginate.js';
import type { Sku } from '../../../shared/domain/sku.value-object.js';
import { StockItem } from '../../domain/stock-item.entity.js';
import type { StockItemSnapshot } from '../../domain/stock-item.snapshot.js';
import type { StockMovement } from '../../domain/stock-movement.js';
import type { MovementSearchParams } from '../movement-search.js';
import type { StockItemRepository } from '../ports/stock-item.repository.js';

/** Cada movimento guarda o SKU e a ordem de gravação, como uma linha de tabela. */
type MovementRecord = {
  sku: string;
  sequence: number;
  movement: StockMovement;
};

/** Mesmo horário? Vale a ordem de gravação, na direção pedida. */
function chronological(first: MovementRecord, second: MovementRecord): number {
  const byTime =
    first.movement.occurredAt.getTime() - second.movement.occurredAt.getTime();
  return byTime || first.sequence - second.sequence;
}

export class InMemoryStockItemRepository implements StockItemRepository {
  private readonly snapshots = new Map<string, StockItemSnapshot>();
  private readonly movements: MovementRecord[] = [];

  async save(stockItem: StockItem): Promise<void> {
    const snapshot = stockItem.toSnapshot();
    this.snapshots.set(snapshot.sku, snapshot);
    for (const movement of stockItem.pullMovements()) {
      const sequence = this.movements.length;
      this.movements.push({ sku: snapshot.sku, sequence, movement });
    }
  }

  async findBySku(sku: Sku): Promise<StockItem | null> {
    const snapshot = this.snapshots.get(sku.toString());
    return snapshot ? StockItem.restore(snapshot) : null;
  }

  async findMovements(
    sku: Sku,
    params: MovementSearchParams,
  ): Promise<SearchResult<StockMovement>> {
    const direction = params.sortDirection() === SortDirection.DESC ? -1 : 1;
    const matching = this.movements
      .filter((record) => record.sku === sku.toString())
      .sort((first, second) => direction * chronological(first, second));
    return paginate(matching, params).map((record) => record.movement);
  }
}
