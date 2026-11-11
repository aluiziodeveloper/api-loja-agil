import type { SearchResult } from '../../../shared/application/search/search-result.js';
import type { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import type { Order } from '../../domain/order.entity.js';
import type { OrderSearchParams } from '../order-search.js';

export abstract class OrderRepository {
  abstract save(order: Order): Promise<void>;
  abstract findById(id: UniqueId): Promise<Order | null>;
  abstract listByCustomer(
    customerId: UniqueId,
    params: OrderSearchParams,
  ): Promise<SearchResult<Order>>;
}
