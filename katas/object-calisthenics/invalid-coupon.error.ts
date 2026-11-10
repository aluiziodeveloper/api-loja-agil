import { DomainError } from '../../src/shared/domain/domain-error.js';

export class InvalidCouponError extends DomainError {
  readonly code = 'INVALID_COUPON';

  constructor(code: string) {
    super(`Cupom inválido: "${code}".`);
  }
}
