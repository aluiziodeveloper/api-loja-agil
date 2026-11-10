import { DomainError } from '../../shared/domain/domain-error.js';

export class TooManyOrderItemsError extends DomainError {
  readonly code = 'TOO_MANY_ORDER_ITEMS';

  constructor(limit: number) {
    super(`Um pedido pode ter no máximo ${limit} itens distintos.`);
  }
}
