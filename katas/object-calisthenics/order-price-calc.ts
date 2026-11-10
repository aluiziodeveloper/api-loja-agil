export type Itm = { sku: string; qty: number; price: number };
export type Cust = { name: string; vip: boolean; addr: { state: string } };
export type Ord = { cust: Cust; itms: Itm[]; cpn?: string };

export class OrderPriceCalc {
  calc(o: Ord): number {
    this.ensureHasItems(o.itms);
    const subtotal = this.applyCoupon(this.itemsTotal(o.itms), o.cpn);
    return subtotal + this.shippingFee(o.cust, subtotal);
  }

  private ensureHasItems(itms: Itm[]): void {
    if (itms.length === 0) {
      throw new Error('Pedido sem itens');
    }
  }

  private itemsTotal(itms: Itm[]): number {
    let tot = 0;
    for (const i of itms) {
      tot += this.itemTotal(i);
    }
    return tot;
  }

  private itemTotal(i: Itm): number {
    if (i.qty <= 0) {
      throw new Error('Quantidade inválida');
    }
    if (i.qty < 10) {
      return i.qty * i.price;
    }
    return Math.round((i.qty * i.price * 90) / 100);
  }

  private applyCoupon(tot: number, cpn?: string): number {
    if (!cpn) {
      return tot;
    }
    if (cpn !== 'AGIL10') {
      throw new Error('Cupom inválido');
    }
    return Math.round((tot * 90) / 100);
  }

  private shippingFee(cust: Cust, subtotal: number): number {
    if (cust.vip || subtotal >= 20000) {
      return 0;
    }
    return cust.addr.state === 'SP' ? 1000 : 2500;
  }
}
