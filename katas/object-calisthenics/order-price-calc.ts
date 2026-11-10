import { Coupon } from './coupon.js';
import { Money } from './money.js';
import { Quantity } from './quantity.js';

export type Itm = { sku: string; qty: number; price: number };
export type Cust = { name: string; vip: boolean; addr: { state: string } };
export type Ord = { cust: Cust; itms: Itm[]; cpn?: string };

const BULK_DISCOUNT_PERCENT = 10;
const FREE_SHIPPING_THRESHOLD = Money.ofCents(20000);
const SHIPPING_FEE_SP = Money.ofCents(1000);
const SHIPPING_FEE_OTHER_STATES = Money.ofCents(2500);

export class OrderPriceCalc {
  calc(o: Ord): number {
    this.ensureHasItems(o.itms);
    const subtotal = this.applyCoupon(this.itemsTotal(o.itms), o.cpn);
    return subtotal.add(this.shippingFee(o.cust, subtotal)).toCents();
  }

  private ensureHasItems(itms: Itm[]): void {
    if (itms.length === 0) {
      throw new Error('Pedido sem itens');
    }
  }

  private itemsTotal(itms: Itm[]): Money {
    let tot = Money.zero();
    for (const i of itms) {
      tot = tot.add(this.itemTotal(i));
    }
    return tot;
  }

  private itemTotal(i: Itm): Money {
    const quantity = Quantity.of(i.qty);
    const total = quantity.times(Money.ofCents(i.price));
    if (!quantity.isBulk()) {
      return total;
    }
    return total.percentOff(BULK_DISCOUNT_PERCENT);
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
