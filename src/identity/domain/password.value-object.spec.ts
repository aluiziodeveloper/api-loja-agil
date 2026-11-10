import { Password } from './password.value-object.js';
import { WeakPasswordError } from './weak-password.error.js';

describe('Password', () => {
  it('should accept a password with at least 8 characters, letters and digits', () => {
    const password = Password.create('agil2026');

    expect(password.reveal()).toBe('agil2026');
  });

  it('should keep spaces and symbols exactly as typed', () => {
    const password = Password.create(' Loja Ágil #1 ');

    expect(password.reveal()).toBe(' Loja Ágil #1 ');
  });

  it.each([
    ['shorter than 8 characters', 'agil202'],
    ['without digits', 'lojaagil'],
    ['without letters', '20262026'],
    ['longer than 128 characters', `a1${'x'.repeat(127)}`],
  ])('should reject a password %s', (_, value) => {
    expect(() => Password.create(value)).toThrow(WeakPasswordError);
  });

  it('should report the WEAK_PASSWORD code without echoing the password', () => {
    expect(() => Password.create('123')).toThrow(
      expect.objectContaining({
        code: 'WEAK_PASSWORD',
        message:
          'A senha deve ter entre 8 e 128 caracteres, com letras e números.',
      }),
    );
  });

  it('should hide the value when converted to text or JSON', () => {
    const password = Password.create('agil2026');

    expect(String(password)).toBe('********');
    expect(JSON.stringify({ password })).toBe('{"password":"********"}');
  });
});
