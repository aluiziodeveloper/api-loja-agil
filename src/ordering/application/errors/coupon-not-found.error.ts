import { DomainError } from '../../../shared/domain/domain-error.js';

export class CouponNotFoundError extends DomainError {
  readonly code = 'COUPON_NOT_FOUND';

  constructor(code: string) {
    super(`Cupom "${code}" não encontrado.`);
  }
}
