import type { SearchResult } from '../../../shared/application/search/search-result.js';
import type { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import type { Order } from '../../domain/order.entity.js';
import type { OrderSearchParams } from '../order-search.js';

export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: UniqueId): Promise<Order | null>;
  listByCustomer(
    customerId: UniqueId,
    params: OrderSearchParams,
  ): Promise<SearchResult<Order>>;
}
