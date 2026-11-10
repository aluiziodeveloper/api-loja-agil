import { Money } from '../../shared/domain/money.value-object.js';
import { Sku } from '../../shared/domain/sku.value-object.js';
import { UniqueId } from '../../shared/domain/unique-id.value-object.js';
import { Order } from './order.entity.js';
import { OrderItem } from './order-item.value-object.js';
import type { OrderSnapshot } from './order.snapshot.js';
import { OrderStatus } from './order-status.js';
import { Quantity } from './quantity.value-object.js';

const NOW = new Date('2026-11-10T12:00:00.000Z');
const CUSTOMER_ID = '01890a5d-ac96-774b-bcce-b302099a8057';

function mugs(units: number): OrderItem {
  return OrderItem.create({
    sku: Sku.create('CAN001'),
    unitPrice: Money.fromCents(4990),
    quantity: Quantity.of(units),
  });
}

const storedDraft: OrderSnapshot = {
  id: '01890a5d-ac96-774b-bcce-b302099a8058',
  customerId: CUSTOMER_ID,
  status: OrderStatus.DRAFT,
  items: [{ sku: 'CAN001', unitPriceInCents: 4990, quantity: 2 }],
  createdAt: NOW,
};

describe('Order', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('draft', () => {
    it('should start as an empty draft of a customer', () => {
      const order = Order.draft(UniqueId.from(CUSTOMER_ID));

      expect(order.toSnapshot()).toEqual({
        id: order.id.toString(),
        customerId: CUSTOMER_ID,
        status: 'DRAFT',
        items: [],
        createdAt: NOW,
      });
    });

    it('should be rebuilt from its snapshot', () => {
      expect(Order.restore(storedDraft).toSnapshot()).toEqual(storedDraft);
    });
  });

  describe('items', () => {
    it('should add items and compute the subtotal', () => {
      const order = Order.restore(storedDraft);

      order.addItem(mugs(1));

      expect(order.toSnapshot().items).toEqual([
        { sku: 'CAN001', unitPriceInCents: 4990, quantity: 3 },
      ]);
      expect(order.subtotal()).toEqual(Money.fromCents(14_970));
    });

    it('should remove the item of a SKU', () => {
      const order = Order.restore(storedDraft);

      order.removeItem(Sku.create('CAN001'));

      expect(order.toSnapshot().items).toEqual([]);
    });

    it.each([OrderStatus.PLACED, OrderStatus.CANCELLED])(
      'should refuse to change the items of a %s order',
      (status) => {
        const order = Order.restore({ ...storedDraft, status });

        expect(() => order.addItem(mugs(1))).toThrow(
          expect.objectContaining({
            code: 'ORDER_NOT_EDITABLE',
            message: `Só é possível alterar pedidos em rascunho; este está ${status}.`,
          }),
        );
        expect(() => order.removeItem(Sku.create('CAN001'))).toThrow(
          expect.objectContaining({ code: 'ORDER_NOT_EDITABLE' }),
        );
      },
    );
  });
});
