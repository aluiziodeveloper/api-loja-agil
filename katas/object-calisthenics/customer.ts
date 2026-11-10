import type { Address } from './address.js';
import { Money } from './money.js';

const FREE_SHIPPING_THRESHOLD = Money.ofCents(20000);

export class Customer {
  private constructor(
    private readonly vip: boolean,
    private readonly address: Address,
  ) {}

  static of(vip: boolean, address: Address): Customer {
    return new Customer(vip, address);
  }

  shippingFeeFor(subtotal: Money): Money {
    if (this.vip || subtotal.isAtLeast(FREE_SHIPPING_THRESHOLD)) {
      return Money.zero();
    }
    return this.address.standardShippingFee();
  }
}
