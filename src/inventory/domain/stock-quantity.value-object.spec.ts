import { InvalidStockQuantityError } from './invalid-stock-quantity.error.js';
import { StockQuantity } from './stock-quantity.value-object.js';

describe('StockQuantity', () => {
  it('should hold a whole number of units', () => {
    expect(StockQuantity.of(12).toNumber()).toBe(12);
    expect(StockQuantity.zero().toNumber()).toBe(0);
  });

  it.each([
    ['a negative amount', -1],
    ['a fraction', 2.5],
    ['NaN', Number.NaN],
    ['an amount beyond the safe integer range', Number.MAX_SAFE_INTEGER + 1],
  ])('should reject %s', (_case, units) => {
    expect(() => StockQuantity.of(units)).toThrow(InvalidStockQuantityError);
  });

  it('should report the INVALID_STOCK_QUANTITY code', () => {
    expect(() => StockQuantity.of(-1)).toThrow(
      expect.objectContaining({
        code: 'INVALID_STOCK_QUANTITY',
        message:
          'Quantidade de estoque inválida: -1. Use um número inteiro não negativo.',
      }),
    );
  });

  it('should add and subtract quantities', () => {
    const ten = StockQuantity.of(10);

    expect(ten.add(StockQuantity.of(5)).toNumber()).toBe(15);
    expect(ten.subtract(StockQuantity.of(4)).toNumber()).toBe(6);
  });

  it('should never become negative', () => {
    expect(() => StockQuantity.of(3).subtract(StockQuantity.of(4))).toThrow(
      InvalidStockQuantityError,
    );
  });

  it('should compare quantities', () => {
    const three = StockQuantity.of(3);

    expect(three.isLessThan(StockQuantity.of(4))).toBe(true);
    expect(three.isLessThan(StockQuantity.of(3))).toBe(false);
    expect(three.isZero()).toBe(false);
    expect(StockQuantity.zero().isZero()).toBe(true);
  });
});
