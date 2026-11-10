import { DomainError } from '../../shared/domain/domain-error.js';

export class OrderItemNotFoundError extends DomainError {
  readonly code = 'ORDER_ITEM_NOT_FOUND';

  constructor(sku: string) {
    super(`O pedido não tem item com o SKU "${sku}".`);
  }
}
