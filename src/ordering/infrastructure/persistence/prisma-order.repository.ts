import { SearchResult } from '../../../shared/application/search/search-result.js';
import type { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import { pageOf } from '../../../shared/infrastructure/database/page-of.js';
import type { PrismaDatabase } from '../../../shared/infrastructure/database/prisma-database.js';
import type { OrderSearchParams } from '../../application/order-search.js';
import type { OrderRepository } from '../../application/ports/order.repository.js';
import { Order } from '../../domain/order.entity.js';
import {
  itemRows,
  orderColumns,
  toOrderSnapshot,
  WITH_ITEMS,
} from './order-row.mapper.js';

/** Mais recentes primeiro por padrão; no empate, o id (D17). */
function newestFirst(params: OrderSearchParams) {
  const direction = params.sortDirection();
  return [{ createdAt: direction }, { id: direction }];
}

export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly database: PrismaDatabase) {}

  /** Os itens são trocados inteiros, na mesma escrita do pedido. */
  async save(order: Order): Promise<void> {
    const snapshot = order.toSnapshot();
    const data = orderColumns(snapshot);
    const items = itemRows(snapshot);
    await this.database.client().order.upsert({
      where: { id: snapshot.id },
      create: { id: snapshot.id, ...data, items: { create: items } },
      update: { ...data, items: { deleteMany: {}, create: items } },
    });
  }

  async findById(id: UniqueId): Promise<Order | null> {
    const row = await this.database.client().order.findUnique({
      where: { id: id.toString() },
      include: WITH_ITEMS,
    });
    return row ? Order.restore(toOrderSnapshot(row)) : null;
  }

  async listByCustomer(
    customerId: UniqueId,
    params: OrderSearchParams,
  ): Promise<SearchResult<Order>> {
    const where = { customerId: customerId.toString() };
    const page = pageOf(params, newestFirst(params));
    const client = this.database.client();
    const [rows, total] = await Promise.all([
      client.order.findMany({ where, include: WITH_ITEMS, ...page }),
      client.order.count({ where }),
    ]);
    const items = rows.map((row) => Order.restore(toOrderSnapshot(row)));
    return SearchResult.create({ items, total, params });
  }
}
