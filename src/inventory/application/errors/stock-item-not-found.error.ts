import { DomainError } from '../../../shared/domain/domain-error.js';

export class StockItemNotFoundError extends DomainError {
  readonly code = 'STOCK_ITEM_NOT_FOUND';

  constructor(sku: string) {
    super(`Não há estoque registrado para o SKU "${sku}".`);
  }
}
