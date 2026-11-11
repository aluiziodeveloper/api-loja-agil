import { SortDirection } from '../../../shared/application/search/search-params.js';
import type { SearchResult } from '../../../shared/application/search/search-result.js';
import { paginate } from '../../../shared/application/__tests__/paginate.js';
import type { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import { Order } from '../../domain/order.entity.js';
import type { OrderSnapshot } from '../../domain/order.snapshot.js';
import type { Restorable } from '../../../shared/application/__tests__/in-memory-transaction.js';
import type { OrderSearchParams } from '../order-search.js';
import type { OrderRepository } from '../ports/order.repository.js';

/** Data de criação e, no empate, o id (D17). */
function byCreation(first: OrderSnapshot, second: OrderSnapshot): number {
  const byTime = first.createdAt.getTime() - second.createdAt.getTime();
  return byTime || first.id.localeCompare(second.id);
}

/** Guarda cópias: o snapshot tem `Date` e listas, que são mutáveis. */
export class InMemoryOrderRepository implements OrderRepository, Restorable {
  private snapshots = new Map<string, OrderSnapshot>();

  /** Os snapshots guardados nunca mudam: copiar o mapa basta. */
  checkpoint(): () => void {
    const saved = new Map(this.snapshots);
    return () => {
      this.snapshots = saved;
    };
  }

  async save(order: Order): Promise<void> {
    const snapshot = order.toSnapshot();
    this.snapshots.set(snapshot.id, structuredClone(snapshot));
  }

  async findById(id: UniqueId): Promise<Order | null> {
    const snapshot = this.snapshots.get(id.toString());
    return snapshot ? Order.restore(structuredClone(snapshot)) : null;
  }

  async listByCustomer(
    customerId: UniqueId,
    params: OrderSearchParams,
  ): Promise<SearchResult<Order>> {
    const direction = params.sortDirection() === SortDirection.DESC ? -1 : 1;
    const matching = [...this.snapshots.values()]
      .filter((snapshot) => snapshot.customerId === customerId.toString())
      .sort((first, second) => direction * byCreation(first, second));
    return paginate(matching, params).map((snapshot) =>
      Order.restore(structuredClone(snapshot)),
    );
  }
}
