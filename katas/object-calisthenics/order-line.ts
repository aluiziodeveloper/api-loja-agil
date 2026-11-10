import type { Money } from './money.js';
import type { Quantity } from './quantity.js';

const BULK_DISCOUNT_PERCENT = 10;

export class OrderLine {
  private constructor(
    private readonly sku: string,
    private readonly quantity: Quantity,
    private readonly unitPrice: Money,
  ) {}

  static of(sku: string, quantity: Quantity, unitPrice: Money): OrderLine {
    return new OrderLine(sku, quantity, unitPrice);
  }

  total(): Money {
    const total = this.quantity.times(this.unitPrice);
    if (!this.quantity.isBulk()) {
      return total;
    }
    return total.percentOff(BULK_DISCOUNT_PERCENT);
  }
}
