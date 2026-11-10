import { DomainError } from '../../../shared/domain/domain-error.js';

export class CouponNotApplicableError extends DomainError {
  readonly code = 'COUPON_NOT_APPLICABLE';

  constructor(code: string) {
    super(`O cupom "${code}" não vale para este pedido.`);
  }
}
