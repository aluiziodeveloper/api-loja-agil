import { Address } from './address.js';
import { Coupon } from './coupon.js';
import { Customer } from './customer.js';
import { Money } from './money.js';
import { OrderLine } from './order-line.js';
import { OrderLines } from './order-lines.js';
import { Product } from './product.js';
import { Quantity } from './quantity.js';

export type OrderItemInput = {
  sku: string;
  quantity: number;
  unitPriceInCents: number;
};
export type CustomerInput = {
  name: string;
  vip: boolean;
  address: { state: string };
};
export type OrderInput = {
  customer: CustomerInput;
  items: OrderItemInput[];
  couponCode?: string;
};

export class OrderPricing {
  totalFor(order: OrderInput): number {
    const lines = this.toOrderLines(order.items);
    const customer = this.toCustomer(order.customer);
    const subtotal = this.applyCoupon(lines.subtotal(), order.couponCode);
    return subtotal.add(customer.shippingFeeFor(subtotal)).toCents();
  }

  private toCustomer(input: CustomerInput): Customer {
    return Customer.of(input.vip, Address.inState(input.address.state));
  }

  private toOrderLines(items: OrderItemInput[]): OrderLines {
    return OrderLines.of(items.map((item) => this.toOrderLine(item)));
  }

  private toOrderLine(item: OrderItemInput): OrderLine {
    const product = Product.of(item.sku, Money.ofCents(item.unitPriceInCents));
    return OrderLine.of(product, Quantity.of(item.quantity));
  }

  private applyCoupon(amount: Money, couponCode?: string): Money {
    if (!couponCode) {
      return amount;
    }
    return Coupon.from(couponCode).applyTo(amount);
  }
}
