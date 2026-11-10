import { InvalidNameError } from './invalid-name.error.js';
import { Name } from './name.value-object.js';

describe('Name', () => {
  it('should trim the value and collapse repeated spaces', () => {
    const name = Name.create('  Ana    Maria  Silva ');

    expect(name.toString()).toBe('Ana Maria Silva');
  });

  it('should keep the original letter case', () => {
    const name = Name.create('Ana de Souza');

    expect(name.toString()).toBe('Ana de Souza');
  });

  it('should accept names from 2 to 100 characters', () => {
    expect(Name.create('Li').toString()).toBe('Li');
    expect(Name.create('a'.repeat(100)).toString()).toHaveLength(100);
  });

  it.each(['', '   ', 'A', 'a'.repeat(101)])(
    'should reject a name with invalid length (%#)',
    (value) => {
      expect(() => Name.create(value)).toThrow(InvalidNameError);
    },
  );

  it('should report the INVALID_NAME code', () => {
    expect(() => Name.create('A')).toThrow(
      expect.objectContaining({
        code: 'INVALID_NAME',
        message: 'Nome inválido: deve ter entre 2 e 100 caracteres.',
      }),
    );
  });
});
