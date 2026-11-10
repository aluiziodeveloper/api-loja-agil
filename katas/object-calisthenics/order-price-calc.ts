export type Itm = { sku: string; qty: number; price: number };
export type Cust = { name: string; vip: boolean; addr: { state: string } };
export type Ord = { cust: Cust; itms: Itm[]; cpn?: string };

export class OrderPriceCalc {
  calc(o: Ord): number {
    let tot = 0;
    if (o.itms.length > 0) {
      for (const i of o.itms) {
        if (i.qty > 0) {
          if (i.qty >= 10) {
            tot += Math.round((i.qty * i.price * 90) / 100);
          } else {
            tot += i.qty * i.price;
          }
        } else {
          throw new Error('Quantidade inválida');
        }
      }
    } else {
      throw new Error('Pedido sem itens');
    }

    if (o.cpn) {
      if (o.cpn === 'AGIL10') {
        tot = Math.round((tot * 90) / 100);
      } else {
        throw new Error('Cupom inválido');
      }
    }

    let frt = 0;
    if (o.cust.vip || tot >= 20000) {
      frt = 0;
    } else {
      if (o.cust.addr.state === 'SP') {
        frt = 1000;
      } else {
        frt = 2500;
      }
    }

    return tot + frt;
  }
}
