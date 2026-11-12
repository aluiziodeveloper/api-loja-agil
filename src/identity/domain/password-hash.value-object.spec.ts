import { InvalidPasswordHashError } from './invalid-password-hash.error.js';
import { PasswordHash } from './password-hash.value-object.js';

describe('PasswordHash', () => {
  it('should keep the hash produced by the infrastructure', () => {
    const hash = PasswordHash.fromHash('scrypt$c2FsdA==$aGFzaA==');

    expect(hash.toString()).toBe('scrypt$c2FsdA==$aGFzaA==');
  });

  it.each(['', '   '])('should reject an empty hash (%#)', (value) => {
    expect(() => PasswordHash.fromHash(value)).toThrow(
      InvalidPasswordHashError,
    );
  });

  it('should report the INVALID_PASSWORD_HASH code', () => {
    expect(() => PasswordHash.fromHash('')).toThrow(
      expect.objectContaining({
        code: 'INVALID_PASSWORD_HASH',
        message: 'Hash de senha inválido: o valor não pode ser vazio.',
      }),
    );
  });
});
