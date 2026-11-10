import type { Money } from '../../../shared/domain/money.value-object.js';

/**
 * Strategy: cada tipo de cupom calcula o desconto do seu jeito, e o pedido
 * não precisa saber qual é. O desconto nunca passa do subtotal.
 */
export interface DiscountPolicy {
  discountFor(subtotal: Money): Money;
}
