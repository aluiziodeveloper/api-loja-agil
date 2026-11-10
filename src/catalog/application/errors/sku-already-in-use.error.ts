import { DomainError } from '../../../shared/domain/domain-error.js';

export class SkuAlreadyInUseError extends DomainError {
  readonly code = 'SKU_ALREADY_IN_USE';

  constructor(sku: string) {
    super(`O SKU "${sku}" já está em uso.`);
  }
}
