import { Email } from './email.value-object.js';
import { InvalidEmailError } from './invalid-email.error.js';

describe('Email', () => {
  it('should normalize the address to trimmed lowercase', () => {
    const email = Email.create('  Ana.Silva@Loja-Agil.com.BR ');

    expect(email.toString()).toBe('ana.silva@loja-agil.com.br');
  });

  it('should be equal to another email with the same normalized address', () => {
    const email = Email.create('ana@lojaagil.com');

    expect(email.equals(Email.create('ANA@lojaagil.com'))).toBe(true);
    expect(email.equals(Email.create('bia@lojaagil.com'))).toBe(false);
  });

  it.each([
    '',
    '   ',
    'ana',
    'ana@',
    '@lojaagil.com',
    'ana@lojaagil',
    'ana silva@lojaagil.com',
  ])('should reject the invalid address "%s"', (value) => {
    expect(() => Email.create(value)).toThrow(InvalidEmailError);
  });

  it('should reject addresses longer than 254 characters', () => {
    const value = `${'a'.repeat(64)}@${'b'.repeat(186)}.com`;

    expect(value).toHaveLength(255);
    expect(() => Email.create(value)).toThrow(InvalidEmailError);
  });

  it('should report the INVALID_EMAIL code with the rejected value', () => {
    expect(() => Email.create('ana')).toThrow(
      expect.objectContaining({
        code: 'INVALID_EMAIL',
        message: 'E-mail inválido: "ana".',
      }),
    );
  });
});
