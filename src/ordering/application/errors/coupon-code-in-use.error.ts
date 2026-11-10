import { DomainError } from '../../../shared/domain/domain-error.js';

export class CouponCodeInUseError extends DomainError {
  readonly code = 'COUPON_CODE_IN_USE';

  constructor(code: string) {
    super(`Já existe um cupom com o código "${code}".`);
  }
}
