import { OrderPriceCalc, type Cust, type Ord } from './order-price-calc.js';

const customerFromSaoPaulo: Cust = {
  name: 'Ana',
  vip: false,
  addr: { state: 'SP' },
};

const customerFromBahia: Cust = {
  name: 'Bruno',
  vip: false,
  addr: { state: 'BA' },
};

function orderWith(overrides: Partial<Ord>): Ord {
  return {
    cust: customerFromSaoPaulo,
    itms: [{ sku: 'CAM001', qty: 2, price: 4990 }],
    ...overrides,
  };
}

describe('OrderPriceCalc (characterization)', () => {
  const calculator = new OrderPriceCalc();

  it('should charge quantity times price plus the shipping fee for SP', () => {
    const order = orderWith({});

    expect(calculator.calc(order)).toBe(2 * 4990 + 1000);
  });

  it('should sum every item of the order', () => {
    const order = orderWith({
      itms: [
        { sku: 'CAM001', qty: 1, price: 4990 },
        { sku: 'MEI002', qty: 3, price: 1500 },
      ],
    });

    expect(calculator.calc(order)).toBe(4990 + 4500 + 1000);
  });

  it('should give 10% off to items bought in quantities of 10 or more', () => {
    const order = orderWith({
      itms: [{ sku: 'MEI002', qty: 10, price: 1555 }],
    });

    expect(calculator.calc(order)).toBe(13995 + 1000);
  });

  it('should round the bulk discount to the nearest cent', () => {
    const order = orderWith({
      itms: [{ sku: 'MEI002', qty: 11, price: 1555 }],
    });

    expect(calculator.calc(order)).toBe(15395 + 1000);
  });

  it('should apply the AGIL10 coupon over the items total', () => {
    const order = orderWith({ cpn: 'AGIL10' });

    expect(calculator.calc(order)).toBe(8982 + 1000);
  });

  it('should charge a higher shipping fee outside SP', () => {
    const order = orderWith({ cust: customerFromBahia });

    expect(calculator.calc(order)).toBe(9980 + 2500);
  });

  it('should give free shipping to VIP customers', () => {
    const order = orderWith({ cust: { ...customerFromBahia, vip: true } });

    expect(calculator.calc(order)).toBe(9980);
  });

  it('should give free shipping from R$ 200,00 after the coupon', () => {
    const reachesThreshold = orderWith({
      itms: [{ sku: 'TEN003', qty: 1, price: 20000 }],
    });
    const fallsBelowWithCoupon = orderWith({
      itms: [{ sku: 'TEN003', qty: 1, price: 20000 }],
      cpn: 'AGIL10',
    });

    expect(calculator.calc(reachesThreshold)).toBe(20000);
    expect(calculator.calc(fallsBelowWithCoupon)).toBe(18000 + 1000);
  });

  it('should reject an order without items', () => {
    const order = orderWith({ itms: [] });

    expect(() => calculator.calc(order)).toThrow('Pedido sem itens');
  });

  it('should reject items with zero or negative quantity', () => {
    const order = orderWith({ itms: [{ sku: 'CAM001', qty: 0, price: 4990 }] });

    expect(() => calculator.calc(order)).toThrow('Quantidade inválida');
  });

  it('should reject an unknown coupon', () => {
    const order = orderWith({ cpn: 'PROMO50' });

    expect(() => calculator.calc(order)).toThrow('Cupom inválido');
  });
});
