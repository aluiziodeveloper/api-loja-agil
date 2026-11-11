import { PasswordHash } from '../../domain/password-hash.value-object.js';
import { Password } from '../../domain/password.value-object.js';
import { ScryptPasswordHasher } from './scrypt-password-hasher.js';

describe('ScryptPasswordHasher', () => {
  const hasher = new ScryptPasswordHasher();
  const password = Password.create('caneca123');

  it('should never keep the password in the hash', async () => {
    const hash = await hasher.hash(password);

    expect(hash.toString()).toMatch(/^scrypt\$[\w+/=]+\$[\w+/=]+$/);
    expect(hash.toString()).not.toContain('caneca123');
  });

  it('should use a new salt for every hash', async () => {
    const first = await hasher.hash(password);
    const second = await hasher.hash(password);

    expect(first.toString()).not.toBe(second.toString());
  });

  it('should verify the password that produced the hash', async () => {
    const hash = await hasher.hash(password);

    await expect(hasher.verify(password, hash)).resolves.toBe(true);
  });

  it('should reject a different password', async () => {
    const hash = await hasher.hash(password);

    await expect(
      hasher.verify(Password.create('caneca124'), hash),
    ).resolves.toBe(false);
  });

  it.each([
    ['from another algorithm', 'bcrypt$c2FsdA==$aGFzaA=='],
    ['with missing parts', 'scrypt$c2FsdA=='],
    ['with a key of another length', 'scrypt$c2FsdA==$aGFzaA=='],
  ])('should reject a hash %s', async (_, value) => {
    await expect(
      hasher.verify(password, PasswordHash.fromHash(value)),
    ).resolves.toBe(false);
  });
});
