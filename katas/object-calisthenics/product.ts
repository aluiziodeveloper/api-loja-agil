import type { Money } from './money.js';
import type { Quantity } from './quantity.js';

export class Product {
  private constructor(
    private readonly sku: string,
    private readonly unitPrice: Money,
  ) {}

  static of(sku: string, unitPrice: Money): Product {
    return new Product(sku, unitPrice);
  }

  priceFor(quantity: Quantity): Money {
    return quantity.times(this.unitPrice);
  }
}
