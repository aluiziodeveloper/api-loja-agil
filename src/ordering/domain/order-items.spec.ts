import { Money } from '../../shared/domain/money.value-object.js';
import { Sku } from '../../shared/domain/sku.value-object.js';
import { OrderItem } from './order-item.value-object.js';
import { OrderItems } from './order-items.js';

function item(sku: string, units = 1, priceInCents = 1000): OrderItem {
  return OrderItem.restore({
    sku,
    unitPriceInCents: priceInCents,
    quantity: units,
  });
}

function itemsWith(count: number): OrderItems {
  const skus = Array.from({ length: count }, (_, index) => `SKU${100 + index}`);
  return skus.reduce((items, sku) => items.add(item(sku)), OrderItems.empty());
}

describe('OrderItems', () => {
  it('should start empty', () => {
    const items = OrderItems.empty();

    expect(items.isEmpty()).toBe(true);
    expect(items.subtotal()).toEqual(Money.zero());
  });

  it('should add the subtotals of its items', () => {
    const items = OrderItems.empty()
      .add(item('CAN001', 2, 4990))
      .add(item('CAM001', 1, 7990));

    expect(items.subtotal()).toEqual(Money.fromCents(17_970));
  });

  it('should group units of the same SKU in one item (RN09)', () => {
    const items = OrderItems.empty()
      .add(item('CAN001', 2))
      .add(item('CAN001', 3));

    expect(items.toSnapshot()).toEqual([
      { sku: 'CAN001', unitPriceInCents: 1000, quantity: 5 },
    ]);
  });

  it('should never change the original collection', () => {
    const empty = OrderItems.empty();

    empty.add(item('CAN001'));

    expect(empty.isEmpty()).toBe(true);
  });

  it('should accept up to 20 distinct items (RN09)', () => {
    expect(itemsWith(20).add(item('SKU100')).toSnapshot()).toHaveLength(20);
    expect(() => itemsWith(20).add(item('CAN001'))).toThrow(
      expect.objectContaining({
        code: 'TOO_MANY_ORDER_ITEMS',
        message: 'Um pedido pode ter no máximo 20 itens distintos.',
      }),
    );
  });

  it('should remove the item of a SKU', () => {
    const items = OrderItems.empty()
      .add(item('CAN001'))
      .add(item('CAM001'))
      .remove(Sku.create('CAN001'));

    expect(items.toSnapshot().map((snapshot) => snapshot.sku)).toEqual([
      'CAM001',
    ]);
  });

  it('should refuse to remove a SKU that is not in the order', () => {
    expect(() => OrderItems.empty().remove(Sku.create('CAN001'))).toThrow(
      expect.objectContaining({
        code: 'ORDER_ITEM_NOT_FOUND',
        message: 'O pedido não tem item com o SKU "CAN001".',
      }),
    );
  });

  it('should be rebuilt from its snapshot', () => {
    const items = OrderItems.empty().add(item('CAN001', 2)).add(item('CAM001'));

    expect(OrderItems.restore(items.toSnapshot())).toEqual(items);
  });

  it('should list what must be reserved, without prices', () => {
    const items = OrderItems.empty().add(item('CAN001', 2, 4990));

    expect(items.toQuantities()).toEqual([{ sku: 'CAN001', quantity: 2 }]);
  });
});
