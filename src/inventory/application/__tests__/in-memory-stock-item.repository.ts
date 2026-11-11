import { ConcurrentUpdateError } from '../../../shared/application/concurrent-update.error.js';
import { SortDirection } from '../../../shared/application/search/search-params.js';
import type { SearchResult } from '../../../shared/application/search/search-result.js';
import { paginate } from '../../../shared/application/__tests__/paginate.js';
import type { Sku } from '../../../shared/domain/sku.value-object.js';
import { StockItem } from '../../domain/stock-item.entity.js';
import type { StockItemSnapshot } from '../../domain/stock-item.snapshot.js';
import type { StockMovement } from '../../domain/stock-movement.js';
import type { Restorable } from '../../../shared/application/__tests__/in-memory-transaction.js';
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

export class InMemoryStockItemRepository
  implements StockItemRepository, Restorable
{
  private snapshots = new Map<string, StockItemSnapshot>();
  private movements: MovementRecord[] = [];
  /** Versão gravada de cada SKU, e a versão que cada instância carregou. */
  private storedVersions = new Map<string, number>();
  private readonly loadedVersions = new WeakMap<StockItem, number>();

  /** Estado e histórico voltam juntos, como numa transação do banco. */
  checkpoint(): () => void {
    const saved = {
      snapshots: new Map(this.snapshots),
      movements: [...this.movements],
      storedVersions: new Map(this.storedVersions),
    };
    return () => {
      this.snapshots = saved.snapshots;
      this.movements = saved.movements;
      this.storedVersions = saved.storedVersions;
    };
  }

  /** Travamento otimista: só grava se ninguém gravou depois do carregamento. */
  async save(stockItem: StockItem): Promise<void> {
    const snapshot = stockItem.toSnapshot();
    const stored = this.storedVersions.get(snapshot.sku);
    if (stored !== this.loadedVersions.get(stockItem)) {
      throw new ConcurrentUpdateError();
    }
    const version = (stored ?? -1) + 1;
    this.storedVersions.set(snapshot.sku, version);
    this.loadedVersions.set(stockItem, version);
    this.snapshots.set(snapshot.sku, snapshot);
    for (const movement of stockItem.pullMovements()) {
      const sequence = this.movements.length;
      this.movements.push({ sku: snapshot.sku, sequence, movement });
    }
  }

  async findBySku(sku: Sku): Promise<StockItem | null> {
    const snapshot = this.snapshots.get(sku.toString());
    if (!snapshot) {
      return null;
    }
    const stockItem = StockItem.restore(snapshot);
    this.loadedVersions.set(
      stockItem,
      this.storedVersions.get(snapshot.sku) ?? 0,
    );
    return stockItem;
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
