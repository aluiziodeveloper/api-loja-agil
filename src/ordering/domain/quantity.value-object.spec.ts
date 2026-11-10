import { InvalidQuantityError } from './invalid-quantity.error.js';
import { Quantity } from './quantity.value-object.js';

describe('Quantity', () => {
  it.each([1, 37, 100])('should accept %d units', (units) => {
    expect(Quantity.of(units).toNumber()).toBe(units);
  });

  it.each([0, -1, 101, 1.5, Number.NaN])('should reject %d units', (units) => {
    expect(() => Quantity.of(units)).toThrow(InvalidQuantityError);
  });

  it('should explain the limits in the message', () => {
    expect(() => Quantity.of(0)).toThrow(
      expect.objectContaining({
        code: 'INVALID_QUANTITY',
        message: 'Quantidade inválida: 0. Use um número inteiro de 1 a 100.',
      }),
    );
  });

  it('should add quantities within the limit (RN09)', () => {
    expect(Quantity.of(40).add(Quantity.of(60))).toEqual(Quantity.of(100));
    expect(() => Quantity.of(40).add(Quantity.of(61))).toThrow(
      InvalidQuantityError,
    );
  });
});
