import { StockLevel } from './stock-level.value-object.js';
import { StockQuantity } from './stock-quantity.value-object.js';

function level(onHand: number, reserved: number): StockLevel {
  return StockLevel.of(StockQuantity.of(onHand), StockQuantity.of(reserved));
}

describe('StockLevel', () => {
  it('should compute the available units (RN07)', () => {
    expect(level(20, 8).available().toNumber()).toBe(12);
    expect(StockLevel.empty().available().toNumber()).toBe(0);
  });

  it('should refuse more reserved than on hand', () => {
    expect(() => level(7, 8)).toThrow(
      expect.objectContaining({
        code: 'STOCK_BELOW_RESERVED',
        message: 'O estoque físico (7) não pode ficar abaixo do reservado (8).',
      }),
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
});
