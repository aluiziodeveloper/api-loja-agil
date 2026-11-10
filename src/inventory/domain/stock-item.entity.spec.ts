import { Sku } from '../../shared/domain/sku.value-object.js';
import { AdjustmentReason } from './adjustment-reason.value-object.js';
import { LowStockDetected } from './low-stock-detected.event.js';
import { StockItem } from './stock-item.entity.js';
import type { StockItemSnapshot } from './stock-item.snapshot.js';
import { StockMovementType } from './stock-movement.js';
import { StockQuantity } from './stock-quantity.value-object.js';

const NOW = new Date('2026-11-10T12:00:00.000Z');
const MONTHLY_COUNT = AdjustmentReason.create('Contagem mensal');

function newMugStock(): StockItem {
  return StockItem.create(Sku.create('can001'), StockQuantity.of(5));
}

const storedMugStock: StockItemSnapshot = {
  id: '019a6b7e-8c4d-7f3a-9b2e-5d1c0a4e7f62',
  sku: 'CAN001',
  onHand: 20,
  reserved: 8,
  minimumLevel: 5,
};

describe('StockItem', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('create and restore', () => {
    it('should start empty, with nothing reserved', () => {
      const stock = newMugStock();

      expect(stock.toSnapshot()).toEqual({
        id: expect.any(String),
        sku: 'CAN001',
        onHand: 0,
        reserved: 0,
        minimumLevel: 5,
      });
      expect(stock.available().toNumber()).toBe(0);
    });

    it('should rebuild an item from its snapshot', () => {
      const stock = StockItem.restore(storedMugStock);

      expect(stock.toSnapshot()).toEqual(storedMugStock);
      expect(stock.available().toNumber()).toBe(12);
    });

    it('should refuse a snapshot with more reserved than on hand', () => {
      expect(() =>
        StockItem.restore({ ...storedMugStock, reserved: 21 }),
      ).toThrow(expect.objectContaining({ code: 'STOCK_BELOW_RESERVED' }));
    });
  });

  describe('receive', () => {
    it('should add units to the stock on hand', () => {
      const stock = newMugStock();

      stock.receive(StockQuantity.of(30));

      expect(stock.toSnapshot().onHand).toBe(30);
      expect(stock.available().toNumber()).toBe(30);
    });

    it('should record a receipt movement', () => {
      const stock = newMugStock();

      stock.receive(StockQuantity.of(30));

      expect(stock.pullMovements()).toEqual([
        {
          type: StockMovementType.RECEIPT,
          onHandChange: 30,
          reservedChange: 0,
          reason: null,
          occurredAt: NOW,
        },
      ]);
      expect(stock.pullMovements()).toEqual([]);
    });

    it('should refuse to receive zero units', () => {
      expect(() => newMugStock().receive(StockQuantity.zero())).toThrow(
        expect.objectContaining({
          code: 'EMPTY_STOCK_MOVEMENT',
          message: 'A quantidade movimentada deve ser maior que zero.',
        }),
      );
    });
  });

  describe('adjust', () => {
    it('should set the counted units and record the difference', () => {
      const stock = StockItem.restore(storedMugStock);

      stock.adjust(StockQuantity.of(17), MONTHLY_COUNT);

      expect(stock.toSnapshot().onHand).toBe(17);
      expect(stock.pullMovements()).toEqual([
        {
          type: StockMovementType.ADJUSTMENT,
          onHandChange: -3,
          reservedChange: 0,
          reason: 'Contagem mensal',
          occurredAt: NOW,
        },
      ]);
    });

    it('should record nothing when the count matches', () => {
      const stock = StockItem.restore(storedMugStock);

      stock.adjust(StockQuantity.of(20), MONTHLY_COUNT);

      expect(stock.pullMovements()).toEqual([]);
    });

    it('should refuse a count below the reserved units', () => {
      const stock = StockItem.restore(storedMugStock);

      expect(() => stock.adjust(StockQuantity.of(7), MONTHLY_COUNT)).toThrow(
        expect.objectContaining({
          code: 'STOCK_BELOW_RESERVED',
          message:
            'O estoque físico (7) não pode ficar abaixo do reservado (8).',
        }),
      );
      expect(stock.toSnapshot().onHand).toBe(20);
    });

    it('should release units and record the release', () => {
      const stock = StockItem.restore(storedMugStock);

      stock.release(StockQuantity.of(8));

      expect(stock.toSnapshot()).toMatchObject({ onHand: 20, reserved: 0 });
      expect(stock.pullMovements()).toEqual([
        expect.objectContaining({
          type: StockMovementType.RELEASE,
          onHandChange: 0,
          reservedChange: -8,
        }),
      ]);
    });

    it('should commit reserved units and record the commit', () => {
      const stock = StockItem.restore(storedMugStock);

      stock.commit(StockQuantity.of(8));

      expect(stock.toSnapshot()).toMatchObject({ onHand: 12, reserved: 0 });
      expect(stock.pullMovements()).toEqual([
        expect.objectContaining({
          type: StockMovementType.COMMIT,
          onHandChange: -8,
          reservedChange: -8,
        }),
      ]);
    });

    it('should leave the item untouched when a reservation is refused', () => {
      const stock = StockItem.restore(storedMugStock);

      expect(() => stock.reserve(StockQuantity.of(13))).toThrow(
        expect.objectContaining({ code: 'INSUFFICIENT_STOCK' }),
      );
      expect(stock.toSnapshot()).toEqual(storedMugStock);
      expect(stock.pullMovements()).toEqual([]);
    });

    it.each([
      ['reserve', (stock: StockItem) => stock.reserve(StockQuantity.zero())],
      ['release', (stock: StockItem) => stock.release(StockQuantity.zero())],
      ['commit', (stock: StockItem) => stock.commit(StockQuantity.zero())],
    ])('should refuse to %s zero units', (_operation, act) => {
      expect(() => act(StockItem.restore(storedMugStock))).toThrow(
        expect.objectContaining({ code: 'EMPTY_STOCK_MOVEMENT' }),
      );
    });
  });

  describe('minimum level', () => {
    it('should alert when a movement takes the available units below the minimum', () => {
      const stock = StockItem.restore(storedMugStock);

      stock.reserve(StockQuantity.of(8));

      const [event] = stock.pullDomainEvents();
      expect(event).toBeInstanceOf(LowStockDetected);
      expect(event).toMatchObject({
        eventName: 'LowStockDetected',
        aggregateId: storedMugStock.id,
        sku: 'CAN001',
        available: 4,
        minimumLevel: 5,
        occurredAt: NOW,
      });
    });

    it('should alert only once while the stock stays low', () => {
      const stock = StockItem.restore(storedMugStock);

      stock.reserve(StockQuantity.of(8));
      stock.reserve(StockQuantity.of(1));

      expect(stock.pullDomainEvents()).toHaveLength(1);
    });

    it('should not alert while the stock stays at or above the minimum', () => {
      const stock = StockItem.restore(storedMugStock);

      stock.reserve(StockQuantity.of(7));

      expect(stock.isBelowMinimum()).toBe(false);
      expect(stock.pullDomainEvents()).toEqual([]);
    });

    it('should change the minimum level without alerting', () => {
      const stock = StockItem.restore(storedMugStock);

      stock.changeMinimumLevel(StockQuantity.of(15));

      expect(stock.toSnapshot().minimumLevel).toBe(15);
      expect(stock.isBelowMinimum()).toBe(true);
      expect(stock.pullDomainEvents()).toEqual([]);
    });
  });
});
