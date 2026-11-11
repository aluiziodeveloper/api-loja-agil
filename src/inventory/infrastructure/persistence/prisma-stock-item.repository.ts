import { SearchResult } from '../../../shared/application/search/search-result.js';
import type { Sku } from '../../../shared/domain/sku.value-object.js';
import type { PrismaDatabase } from '../../../shared/infrastructure/database/prisma-database.js';
import type { MovementSearchParams } from '../../application/movement-search.js';
import type { StockItemRepository } from '../../application/ports/stock-item.repository.js';
import { StockItem } from '../../domain/stock-item.entity.js';
import type { StockMovement } from '../../domain/stock-movement.js';

/** Só os campos do movimento: o id e a chave do item ficam no banco. */
function toMovement({
  type,
  onHandChange,
  reservedChange,
  reason,
  occurredAt,
}: StockMovement): StockMovement {
  return { type, onHandChange, reservedChange, reason, occurredAt };
}

/** A página pedida. Mesmo horário? Vale a ordem de gravação, na direção pedida. */
function historyPage(params: MovementSearchParams) {
  const direction = params.sortDirection();
  return {
    orderBy: [{ occurredAt: direction }, { id: direction }],
    skip: params.offset(),
    take: params.perPage(),
  };
}

export class PrismaStockItemRepository implements StockItemRepository {
  constructor(private readonly database: PrismaDatabase) {}

  /**
   * Estado e movimentos novos numa escrita só: o Prisma grava um "nested write"
   * dentro de uma transação, então o histórico nunca fica sem o estado (D18).
   */
  async save(stockItem: StockItem): Promise<void> {
    const { id, ...state } = stockItem.toSnapshot();
    const movements = { create: stockItem.pullMovements().map(toMovement) };
    await this.database.client().stockItem.upsert({
      where: { id },
      create: { id, ...state, movements },
      update: { ...state, movements },
    });
  }

  async findBySku(sku: Sku): Promise<StockItem | null> {
    const row = await this.database
      .client()
      .stockItem.findUnique({ where: { sku: sku.toString() } });
    return row ? StockItem.restore(row) : null;
  }

  async findMovements(
    sku: Sku,
    params: MovementSearchParams,
  ): Promise<SearchResult<StockMovement>> {
    const where = { stockItem: { sku: sku.toString() } };
    const client = this.database.client();
    const [rows, total] = await Promise.all([
      client.stockMovement.findMany({ where, ...historyPage(params) }),
      client.stockMovement.count({ where }),
    ]);
    return SearchResult.create({ items: rows.map(toMovement), total, params });
  }
}
