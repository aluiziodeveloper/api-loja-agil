import { DomainError } from '../../../shared/domain/domain-error.js';

export class CouponAlreadyAppliedError extends DomainError {
  readonly code = 'COUPON_ALREADY_APPLIED';

  constructor(code: string) {
    super(
      `O pedido já tem o cupom "${code}"; remova-o antes de aplicar outro.`,
    );
  }
}
