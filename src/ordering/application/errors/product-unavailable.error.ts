import { DomainError } from '../../../shared/domain/domain-error.js';

export class ProductUnavailableError extends DomainError {
  readonly code = 'PRODUCT_UNAVAILABLE';

  constructor(sku: string) {
    super(`O produto "${sku}" não está disponível para venda.`);
  }
}
