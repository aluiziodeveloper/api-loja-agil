import type { Money } from './money.js';
import type { Product } from './product.js';
import type { Quantity } from './quantity.js';

const BULK_DISCOUNT_PERCENT = 10;

export class OrderLine {
  private constructor(
    private readonly product: Product,
    private readonly quantity: Quantity,
  ) {}

  static of(product: Product, quantity: Quantity): OrderLine {
    return new OrderLine(product, quantity);
  }

  total(): Money {
    const total = this.product.priceFor(this.quantity);
    if (!this.quantity.isBulk()) {
      return total;
    }
    return total.percentOff(BULK_DISCOUNT_PERCENT);
  }
}
