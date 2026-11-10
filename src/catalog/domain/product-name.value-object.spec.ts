import { InvalidProductNameError } from './invalid-product-name.error.js';
import { ProductName } from './product-name.value-object.js';

describe('ProductName', () => {
  it('should trim the value and collapse repeated spaces', () => {
    expect(ProductName.create('  Camiseta   Azul ').toString()).toBe(
      'Camiseta Azul',
    );
  });

  it('should accept names from 2 to 120 characters', () => {
    expect(ProductName.create('TV').toString()).toBe('TV');
    expect(ProductName.create('a'.repeat(120)).toString()).toHaveLength(120);
  });

  it.each(['', '   ', 'A', 'a'.repeat(121)])(
    'should reject a name with invalid length (%#)',
    (value) => {
      expect(() => ProductName.create(value)).toThrow(InvalidProductNameError);
    },
  );

  it('should report the INVALID_PRODUCT_NAME code', () => {
    expect(() => ProductName.create('A')).toThrow(
      expect.objectContaining({
        code: 'INVALID_PRODUCT_NAME',
        message: 'Nome de produto inválido: deve ter entre 2 e 120 caracteres.',
      }),
    );
  });
});
