import { Coupon } from './coupon.js';
import { Money } from './money.js';
import { OrderLine } from './order-line.js';
import { OrderLines } from './order-lines.js';
import { Quantity } from './quantity.js';

export type Itm = { sku: string; qty: number; price: number };
export type Cust = { name: string; vip: boolean; addr: { state: string } };
export type Ord = { cust: Cust; itms: Itm[]; cpn?: string };

const FREE_SHIPPING_THRESHOLD = Money.ofCents(20000);
const SHIPPING_FEE_SP = Money.ofCents(1000);
const SHIPPING_FEE_OTHER_STATES = Money.ofCents(2500);

export class OrderPriceCalc {
  calc(o: Ord): number {
    const lines = this.toOrderLines(o.itms);
    const subtotal = this.applyCoupon(lines.subtotal(), o.cpn);
    return subtotal.add(this.shippingFee(o.cust, subtotal)).toCents();
  }

  private toOrderLines(itms: Itm[]): OrderLines {
    return OrderLines.of(
      itms.map((i) =>
        OrderLine.of(i.sku, Quantity.of(i.qty), Money.ofCents(i.price)),
      ),
    );
  }

  private applyCoupon(tot: Money, cpn?: string): Money {
    if (!cpn) {
      return tot;
    }
    return Coupon.from(cpn).applyTo(tot);
  }

  private shippingFee(cust: Cust, subtotal: Money): Money {
    if (cust.vip || subtotal.isAtLeast(FREE_SHIPPING_THRESHOLD)) {
      return Money.zero();
    }
    return cust.addr.state === 'SP'
      ? SHIPPING_FEE_SP
      : SHIPPING_FEE_OTHER_STATES;
  }
}
