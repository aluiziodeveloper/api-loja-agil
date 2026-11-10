import { InvalidSkuError } from './invalid-sku.error.js';
import { Sku } from './sku.value-object.js';

describe('Sku', () => {
  it('should normalize to uppercase without surrounding spaces', () => {
    expect(Sku.create('  cam123-azul ').toString()).toBe('CAM123-AZUL');
  });

  it.each([
    'ABC',
    'CAMISA',
    'ABC123',
    'ABCDEF123456',
    'ABC123-P',
    'CAM123-AZUL',
  ])('should accept %s', (value) => {
    expect(Sku.create(value).toString()).toBe(value);
  });

  it.each([
    ['too short', 'AB'],
    ['too long', 'ABCDEFGHIJ123'],
    ['an empty variant', 'ABC123-'],
    ['a variant that is too long', 'ABC123-VARIANT'],
    ['two variants', 'ABC123-P-AZUL'],
    ['spaces inside', 'ABC 123'],
    ['accented letters', 'CAMISÃ'],
    ['symbols', 'ABC_123'],
  ])('should reject a SKU with %s', (_case, value) => {
    expect(() => Sku.create(value)).toThrow(InvalidSkuError);
  });

  it('should report the INVALID_SKU code', () => {
    expect(() => Sku.create('a b')).toThrow(
      expect.objectContaining({
        code: 'INVALID_SKU',
        message: 'SKU inválido: "a b".',
      }),
    );
  });

  it('should treat different spellings of the same code as equal', () => {
    expect(Sku.create('cam123-azul').equals(Sku.create('CAM123-AZUL'))).toBe(
      true,
    );
  });
});
