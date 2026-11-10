import { Money } from '../../shared/domain/money.value-object.js';
import { Sku } from '../../shared/domain/sku.value-object.js';
import { OrderItem } from './order-item.value-object.js';
import { Quantity } from './quantity.value-object.js';

const MUG = Sku.create('CAN001');

function mugs(units: number): OrderItem {
  return OrderItem.create({
    sku: MUG,
    unitPrice: Money.fromCents(4990),
    quantity: Quantity.of(units),
  });
}

describe('OrderItem', () => {
  it('should compute the subtotal from the frozen unit price', () => {
    expect(mugs(3).subtotal()).toEqual(Money.fromCents(14_970));
  });

  it('should tell whether it is for a SKU', () => {
    expect(mugs(1).isFor(MUG)).toBe(true);
    expect(mugs(1).isFor(Sku.create('CAM001'))).toBe(false);
  });

  it('should merge more units of the same SKU, keeping its price', () => {
    const merged = mugs(2).merge(
      OrderItem.create({
        sku: MUG,
        unitPrice: Money.fromCents(5990),
        quantity: Quantity.of(3),
      }),
    );

    expect(merged).toEqual(mugs(5));
  });

  it('should expose its primitives for the snapshot', () => {
    expect(mugs(2).toSnapshot()).toEqual({
      sku: 'CAN001',
      unitPriceInCents: 4990,
      quantity: 2,
    });
  });

  it('should be rebuilt from its snapshot', () => {
    expect(OrderItem.restore(mugs(2).toSnapshot())).toEqual(mugs(2));
  });
});
