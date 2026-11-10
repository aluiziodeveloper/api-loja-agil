import {
  OrderPricing,
  type CustomerInput,
  type OrderInput,
} from './order-pricing.js';

const customerFromSaoPaulo: CustomerInput = {
  name: 'Ana',
  vip: false,
  address: { state: 'SP' },
};

const customerFromBahia: CustomerInput = {
  name: 'Bruno',
  vip: false,
  address: { state: 'BA' },
};

function orderWith(overrides: Partial<OrderInput>): OrderInput {
  return {
    customer: customerFromSaoPaulo,
    items: [{ sku: 'CAM001', quantity: 2, unitPriceInCents: 4990 }],
    ...overrides,
  };
}

describe('OrderPricing (characterization)', () => {
  const pricing = new OrderPricing();

  it('should charge quantity times price plus the shipping fee for SP', () => {
    const order = orderWith({});

    expect(pricing.totalFor(order)).toBe(2 * 4990 + 1000);
  });

  it('should sum every item of the order', () => {
    const order = orderWith({
      items: [
        { sku: 'CAM001', quantity: 1, unitPriceInCents: 4990 },
        { sku: 'MEI002', quantity: 3, unitPriceInCents: 1500 },
      ],
    });

    expect(pricing.totalFor(order)).toBe(4990 + 4500 + 1000);
  });

  it('should give 10% off to items bought in quantities of 10 or more', () => {
    const order = orderWith({
      items: [{ sku: 'MEI002', quantity: 10, unitPriceInCents: 1555 }],
    });

    expect(pricing.totalFor(order)).toBe(13995 + 1000);
  });

  it('should round the bulk discount to the nearest cent', () => {
    const order = orderWith({
      items: [{ sku: 'MEI002', quantity: 11, unitPriceInCents: 1555 }],
    });

    expect(pricing.totalFor(order)).toBe(15395 + 1000);
  });

  it('should apply the AGIL10 coupon over the items total', () => {
    const order = orderWith({ couponCode: 'AGIL10' });

    expect(pricing.totalFor(order)).toBe(8982 + 1000);
  });

  it('should charge a higher shipping fee outside SP', () => {
    const order = orderWith({ customer: customerFromBahia });

    expect(pricing.totalFor(order)).toBe(9980 + 2500);
  });

  it('should give free shipping to VIP customers', () => {
    const order = orderWith({ customer: { ...customerFromBahia, vip: true } });

    expect(pricing.totalFor(order)).toBe(9980);
  });

  it('should give free shipping from R$ 200,00 after the coupon', () => {
    const reachesThreshold = orderWith({
      items: [{ sku: 'TEN003', quantity: 1, unitPriceInCents: 20000 }],
    });
    const fallsBelowWithCoupon = orderWith({
      items: [{ sku: 'TEN003', quantity: 1, unitPriceInCents: 20000 }],
      couponCode: 'AGIL10',
    });

    expect(pricing.totalFor(reachesThreshold)).toBe(20000);
    expect(pricing.totalFor(fallsBelowWithCoupon)).toBe(18000 + 1000);
  });

  it('should reject an order without items', () => {
    const order = orderWith({ items: [] });

    expect(() => pricing.totalFor(order)).toThrow('Pedido sem itens');
  });

  it('should reject items with zero or negative quantity', () => {
    const order = orderWith({
      items: [{ sku: 'CAM001', quantity: 0, unitPriceInCents: 4990 }],
    });

    expect(() => pricing.totalFor(order)).toThrow('Quantidade inválida');
  });

  it('should reject an unknown coupon', () => {
    const order = orderWith({ couponCode: 'PROMO50' });

    expect(() => pricing.totalFor(order)).toThrow('Cupom inválido');
  });
});
