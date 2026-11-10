import type { Money } from '../../../shared/domain/money.value-object.js';

/** O que as regras de um cupom avaliam: o subtotal do pedido e o momento. */
export type CouponCandidate = {
  subtotal: Money;
  at: Date;
};
