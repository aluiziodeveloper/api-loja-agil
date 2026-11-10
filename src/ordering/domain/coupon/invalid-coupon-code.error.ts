import { DomainError } from '../../../shared/domain/domain-error.js';

export class InvalidCouponCodeError extends DomainError {
  readonly code = 'INVALID_COUPON_CODE';

  constructor(value: string) {
    super(
      `Código de cupom inválido: "${value}". Use de 4 a 20 letras ou números.`,
    );
  }
}
