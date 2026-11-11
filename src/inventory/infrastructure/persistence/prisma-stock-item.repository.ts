import { Prisma } from '../../../generated/prisma/client.js';
import { ConcurrentUpdateError } from '../../../shared/application/concurrent-update.error.js';
import { SearchResult } from '../../../shared/application/search/search-result.js';
import type { Sku } from '../../../shared/domain/sku.value-object.js';
import { pageOf } from '../../../shared/infrastructure/database/page-of.js';
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

/** Mesmo horário? Vale a ordem de gravação, na direção pedida. */
function chronological(params: MovementSearchParams) {
  const direction = params.sortDirection();
  return [{ occurredAt: direction }, { id: direction }];
}

/** Linha que sumiu (versão mudou) ou SKU que já existe: outra operação chegou antes. */
const CONFLICT_CODES = new Set(['P2025', 'P2002']);

function conflictOr(error: unknown): unknown {
  const conflict =
    error instanceof Prisma.PrismaClientKnownRequestError &&
    CONFLICT_CODES.has(error.code);
  return conflict ? new ConcurrentUpdateError() : error;
}

export class PrismaStockItemRepository implements StockItemRepository {
  constructor(private readonly database: PrismaDatabase) {}

  /** A versão que cada instância carregou; instância nova não tem versão. */
  private readonly versions = new WeakMap<StockItem, number>();

  /**
   * Estado e movimentos novos numa escrita só, e só se a versão no banco ainda
   * for a carregada (travamento otimista). O histórico nunca fica sem o estado.
   */
  async save(stockItem: StockItem): Promise<void> {
    const { id, ...state } = stockItem.toSnapshot();
    const movements = { create: stockItem.pullMovements().map(toMovement) };
    try {
      const row = await this.write(stockItem, { id, ...state, movements });
      this.versions.set(stockItem, row.version);
    } catch (error) {
      throw conflictOr(error);
    }
  }

  async findBySku(sku: Sku): Promise<StockItem | null> {
    const row = await this.database
      .client()
      .stockItem.findUnique({ where: { sku: sku.toString() } });
    if (!row) {
      return null;
    }
    const stockItem = StockItem.restore(row);
    this.versions.set(stockItem, row.version);
    return stockItem;
  }

  async findMovements(
    sku: Sku,
    params: MovementSearchParams,
  ): Promise<SearchResult<StockMovement>> {
    const where = { stockItem: { sku: sku.toString() } };
    const page = pageOf(params, chronological(params));
    const client = this.database.client();
    const [rows, total] = await Promise.all([
      client.stockMovement.findMany({ where, ...page }),
      client.stockMovement.count({ where }),
    ]);
    return SearchResult.create({ items: rows.map(toMovement), total, params });
  }

  /** Instância nova: cria. Carregada: atualiza, se a versão ainda for a mesma. */
  private write(stockItem: StockItem, data: Prisma.StockItemCreateInput) {
    const loaded = this.versions.get(stockItem);
    const items = this.database.client().stockItem;
    if (loaded === undefined) {
      return items.create({ data });
    }
    const { id, ...changes } = data;
    return items.update({
      where: { id, version: loaded },
      data: { ...changes, version: loaded + 1 },
    });
  }
}
