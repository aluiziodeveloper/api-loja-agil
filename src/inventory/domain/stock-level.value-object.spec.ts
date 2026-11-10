import { StockLevel } from './stock-level.value-object.js';
import { StockQuantity } from './stock-quantity.value-object.js';

function level(onHand: number, reserved: number): StockLevel {
  return StockLevel.fromPrimitives(onHand, reserved);
}

describe('StockLevel', () => {
  it('should compute the available units (RN07)', () => {
    expect(level(20, 8).available().toNumber()).toBe(12);
    expect(StockLevel.empty().available().toNumber()).toBe(0);
  });

  it('should refuse more reserved than on hand', () => {
    expect(() =>
      StockLevel.of(StockQuantity.of(7), StockQuantity.of(8)),
    ).toThrow(
      expect.objectContaining({
        code: 'STOCK_BELOW_RESERVED',
        message: 'O estoque físico (7) não pode ficar abaixo do reservado (8).',
      }),
    );
  });

  it.each([
    ['receive', (stock: StockLevel) => stock.receive(StockQuantity.zero())],
    ['reserve', (stock: StockLevel) => stock.reserve(StockQuantity.zero())],
    ['release', (stock: StockLevel) => stock.release(StockQuantity.zero())],
    ['commit', (stock: StockLevel) => stock.commit(StockQuantity.zero())],
  ])('should refuse to %s zero units', (_operation, act) => {
    expect(() => act(level(20, 8))).toThrow(
      expect.objectContaining({ code: 'EMPTY_STOCK_MOVEMENT' }),
    );
  });

  it('should add received units to the stock on hand', () => {
    expect(level(20, 8).receive(StockQuantity.of(5))).toEqual(level(25, 8));
  });

  it('should replace the stock on hand with a count', () => {
    expect(level(20, 8).countedAs(StockQuantity.of(17))).toEqual(level(17, 8));
  });

  it('should refuse a count below the reserved units', () => {
    expect(() => level(20, 8).countedAs(StockQuantity.of(7))).toThrow(
      expect.objectContaining({ code: 'STOCK_BELOW_RESERVED' }),
    );
  });

  it('should describe the change to another level', () => {
    expect(level(20, 8).changeTo(level(17, 10))).toEqual({
      onHandChange: -3,
      reservedChange: 2,
    });
  });

  it('should expose its numbers for the snapshot', () => {
    expect(level(20, 8).toPrimitives()).toEqual({ onHand: 20, reserved: 8 });
  });

  describe('reservations', () => {
    it('should reserve available units', () => {
      expect(level(20, 8).reserve(StockQuantity.of(12))).toEqual(level(20, 20));
    });

    it('should refuse to reserve more than is available', () => {
      expect(() => level(20, 8).reserve(StockQuantity.of(13))).toThrow(
        expect.objectContaining({
          code: 'INSUFFICIENT_STOCK',
          message: 'Estoque insuficiente: solicitado 13, disponível 12.',
        }),
      );
    });

    it('should release reserved units back to available', () => {
      const released = level(20, 8).release(StockQuantity.of(3));

      expect(released).toEqual(level(20, 5));
      expect(released.available().toNumber()).toBe(15);
    });

    it('should take committed units out of both on hand and reserved', () => {
      const committed = level(20, 8).commit(StockQuantity.of(8));

      expect(committed).toEqual(level(12, 0));
      expect(committed.available().toNumber()).toBe(12);
    });

    it.each([
      ['release', (stock: StockLevel) => stock.release(StockQuantity.of(9))],
      ['commit', (stock: StockLevel) => stock.commit(StockQuantity.of(9))],
    ])('should refuse to %s more than is reserved', (_operation, act) => {
      expect(() => act(level(20, 8))).toThrow(
        expect.objectContaining({
          code: 'RESERVED_STOCK_EXCEEDED',
          message: 'A quantidade (9) é maior que a reservada (8).',
        }),
      );
    });
  });

  describe('minimum level', () => {
    const minimum = StockQuantity.of(5);

    it('should tell whether the available units are below a minimum', () => {
      expect(level(10, 6).isBelow(minimum)).toBe(true);
      expect(level(10, 5).isBelow(minimum)).toBe(false);
    });

    it.each([
      {
        when: 'crosses it',
        previous: level(10, 5),
        next: level(10, 6),
        fell: true,
      },
      {
        when: 'was already below it',
        previous: level(10, 6),
        next: level(10, 7),
        fell: false,
      },
      {
        when: 'stays at it',
        previous: level(10, 4),
        next: level(10, 5),
        fell: false,
      },
      {
        when: 'goes back above it',
        previous: level(10, 6),
        next: level(20, 6),
        fell: false,
      },
    ])(
      'should report a fall below the minimum only when the level $when',
      ({ previous, next, fell }) => {
        expect(next.fellBelow(minimum, previous)).toBe(fell);
      },
    );
  });
});
