import { Money } from '../../shared/domain/money.value-object.js';
import { Sku } from '../../shared/domain/sku.value-object.js';
import { UniqueId } from '../../shared/domain/unique-id.value-object.js';
import { OrderCancelled } from './events/order-cancelled.event.js';
import { OrderPaid } from './events/order-paid.event.js';
import { OrderPlaced } from './events/order-placed.event.js';
import { OrderShipped } from './events/order-shipped.event.js';
import type { CouponSnapshot } from './coupon/coupon.snapshot.js';
import { Coupon } from './coupon/coupon.entity.js';
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
  coupon: null,
  createdAt: NOW,
};

/** 10% até R$ 20,00, para pedidos a partir de R$ 50,00. */
const agil10: CouponSnapshot = {
  id: '01890a5d-ac96-774b-bcce-b302099a8060',
  code: 'AGIL10',
  discount: { type: 'PERCENTAGE', percent: 10, capInCents: 2000 },
  minimumOrderInCents: 5000,
  expiresAt: new Date('2026-11-30T23:59:59.999Z'),
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
        coupon: null,
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
      expect(order.prices().subtotal).toEqual(Money.fromCents(14_970));
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

  describe('lifecycle', () => {
    function inStatus(status: OrderStatus): Order {
      return Order.restore({ ...storedDraft, status });
    }

    it('should place a draft with items and announce it', () => {
      const order = inStatus(OrderStatus.DRAFT);

      order.place();

      expect(order.toSnapshot().status).toBe('PLACED');
      const [event] = order.pullDomainEvents();
      expect(event).toBeInstanceOf(OrderPlaced);
      expect(event).toMatchObject({
        eventName: 'OrderPlaced',
        aggregateId: storedDraft.id,
        customerId: CUSTOMER_ID,
        items: [{ sku: 'CAN001', quantity: 2 }],
        totalInCents: 9980,
        occurredAt: NOW,
      });
    });

    it('should refuse to place an empty draft', () => {
      const order = Order.draft(UniqueId.from(CUSTOMER_ID));

      expect(() => order.place()).toThrow(
        expect.objectContaining({
          code: 'EMPTY_ORDER',
          message: 'Adicione ao menos um item antes de confirmar o pedido.',
        }),
      );
    });

    it('should pay a placed order and announce the items to commit', () => {
      const order = inStatus(OrderStatus.PLACED);

      order.pay();

      expect(order.toSnapshot().status).toBe('PAID');
      const [event] = order.pullDomainEvents();
      expect(event).toBeInstanceOf(OrderPaid);
      expect(event).toMatchObject({ items: [{ sku: 'CAN001', quantity: 2 }] });
    });

    it('should ship a paid order', () => {
      const order = inStatus(OrderStatus.PAID);

      order.ship();

      expect(order.toSnapshot().status).toBe('SHIPPED');
      expect(order.pullDomainEvents()[0]).toBeInstanceOf(OrderShipped);
    });

    it.each([OrderStatus.DRAFT, OrderStatus.PLACED, OrderStatus.PAID])(
      'should cancel a %s order, telling what it was',
      (status) => {
        const order = inStatus(status);

        order.cancel();

        expect(order.toSnapshot().status).toBe('CANCELLED');
        const [event] = order.pullDomainEvents();
        expect(event).toBeInstanceOf(OrderCancelled);
        expect(event).toMatchObject({
          previousStatus: status,
          items: [{ sku: 'CAN001', quantity: 2 }],
        });
      },
    );

    it('should refuse a transition outside the lifecycle', () => {
      const order = inStatus(OrderStatus.SHIPPED);

      expect(() => order.cancel()).toThrow(
        expect.objectContaining({ code: 'INVALID_ORDER_TRANSITION' }),
      );
      expect(order.toSnapshot().status).toBe('SHIPPED');
      expect(order.pullDomainEvents()).toEqual([]);
    });
  });

  describe('coupon', () => {
    function draftWithCoupon(): Order {
      const order = Order.restore(storedDraft);
      order.applyCoupon(Coupon.restore(agil10));
      return order;
    }

    it('should discount the total and keep a copy of the coupon', () => {
      const order = draftWithCoupon();

      expect(order.prices()).toEqual({
        subtotal: Money.fromCents(9980),
        discount: Money.fromCents(998),
        total: Money.fromCents(8982),
      });
      expect(order.toSnapshot().coupon).toEqual(agil10);
    });

    it('should be rebuilt with its coupon', () => {
      const snapshot = { ...storedDraft, coupon: agil10 };

      const order = Order.restore(snapshot);

      expect(order.toSnapshot()).toEqual(snapshot);
      expect(order.prices().discount).toEqual(Money.fromCents(998));
    });

    it('should have no discount without a coupon', () => {
      const order = Order.restore(storedDraft);

      expect(order.prices()).toEqual({
        subtotal: Money.fromCents(9980),
        discount: Money.zero(),
        total: Money.fromCents(9980),
      });
    });

    it('should accept a single coupon per order (RN14)', () => {
      const order = draftWithCoupon();

      expect(() =>
        order.applyCoupon(Coupon.restore({ ...agil10, code: 'NATAL2026' })),
      ).toThrow(
        expect.objectContaining({
          code: 'COUPON_ALREADY_APPLIED',
          message:
            'O pedido já tem o cupom "AGIL10"; remova-o antes de aplicar outro.',
        }),
      );
    });

    it('should refuse a coupon the order is not eligible for', () => {
      const order = Order.restore({
        ...storedDraft,
        items: [{ sku: 'CAN001', unitPriceInCents: 4990, quantity: 1 }],
      });

      expect(() => order.applyCoupon(Coupon.restore(agil10))).toThrow(
        expect.objectContaining({ code: 'COUPON_NOT_APPLICABLE' }),
      );
      expect(order.toSnapshot().coupon).toBeNull();
    });

    it('should remove the coupon', () => {
      const order = draftWithCoupon();

      order.removeCoupon();

      expect(order.toSnapshot().coupon).toBeNull();
      expect(order.prices().discount).toEqual(Money.zero());
    });

    it('should stop discounting when the order falls below the minimum', () => {
      const order = draftWithCoupon();

      order.removeItem(Sku.create('CAN001'));
      order.addItem(mugs(1));

      expect(order.prices().discount).toEqual(Money.zero());
      expect(() => order.place()).toThrow(
        expect.objectContaining({ code: 'COUPON_NOT_APPLICABLE' }),
      );
    });

    it('should place the order with the discounted total', () => {
      const order = draftWithCoupon();

      order.place();

      expect(order.pullDomainEvents()[0]).toMatchObject({ totalInCents: 8982 });
    });

    it('should only change the coupon of a draft', () => {
      const order = Order.restore({
        ...storedDraft,
        status: OrderStatus.PLACED,
      });

      expect(() => order.applyCoupon(Coupon.restore(agil10))).toThrow(
        expect.objectContaining({ code: 'ORDER_NOT_EDITABLE' }),
      );
      expect(() => order.removeCoupon()).toThrow(
        expect.objectContaining({ code: 'ORDER_NOT_EDITABLE' }),
      );
    });
  });
});
