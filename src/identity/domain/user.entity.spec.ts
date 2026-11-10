import { InvalidEmailError } from './invalid-email.error.js';
import { Email } from './email.value-object.js';
import { Name } from './name.value-object.js';
import { PasswordHash } from './password-hash.value-object.js';
import type { PasswordVerifier } from './password-verifier.js';
import { Password } from './password.value-object.js';
import { Role } from './role.js';
import { UserRegistered } from './user-registered.event.js';
import { User, type UserSnapshot } from './user.entity.js';

function registerAna(): User {
  return User.register({
    name: Name.create('Ana Silva'),
    email: Email.create('ana@lojaagil.com'),
    passwordHash: PasswordHash.fromHash('hashed:agil2026'),
  });
}

const storedOperator: UserSnapshot = {
  id: '019a6b7e-8c4d-7f3a-9b2e-5d1c0a4e7f60',
  name: 'Bruno Costa',
  email: 'bruno@lojaagil.com',
  passwordHash: 'hashed:operador1',
  role: Role.OPERATOR,
};

const prefixVerifier: PasswordVerifier = {
  verify: (password, hash) =>
    Promise.resolve(hash.toString() === `hashed:${password.reveal()}`),
};

describe('User', () => {
  describe('register', () => {
    it('should create a customer with a new id and the given data', () => {
      const user = registerAna();

      expect(user.toSnapshot()).toEqual({
        id: user.id.toString(),
        name: 'Ana Silva',
        email: 'ana@lojaagil.com',
        passwordHash: 'hashed:agil2026',
        role: Role.CUSTOMER,
      });
    });

    it('should give each registered user a different id', () => {
      expect(registerAna().equals(registerAna())).toBe(false);
    });

    it('should record the UserRegistered event', () => {
      const user = registerAna();

      const events = user.pullDomainEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(UserRegistered);
      expect(events[0]).toMatchObject({
        aggregateId: user.id.toString(),
        email: 'ana@lojaagil.com',
      });
    });
  });

  describe('restore', () => {
    it('should rebuild a user from a snapshot without recording events', () => {
      const user = User.restore(storedOperator);

      expect(user.toSnapshot()).toEqual(storedOperator);
      expect(user.pullDomainEvents()).toEqual([]);
    });

    it('should reject a snapshot with invalid data', () => {
      const corrupted = { ...storedOperator, email: 'bruno' };

      expect(() => User.restore(corrupted)).toThrow(InvalidEmailError);
    });
  });

  describe('profile changes', () => {
    it('should rename the user', () => {
      const user = registerAna();

      user.rename(Name.create('Ana Souza'));

      expect(user.toSnapshot().name).toBe('Ana Souza');
    });

    it('should change the email', () => {
      const user = registerAna();

      user.changeEmail(Email.create('ana.souza@lojaagil.com'));

      expect(user.hasEmail(Email.create('ana.souza@lojaagil.com'))).toBe(true);
      expect(user.hasEmail(Email.create('ana@lojaagil.com'))).toBe(false);
    });

    it('should change the password hash', () => {
      const user = registerAna();

      user.changePassword(PasswordHash.fromHash('hashed:nova2026'));

      expect(user.toSnapshot().passwordHash).toBe('hashed:nova2026');
    });
  });

  describe('authenticate', () => {
    it('should accept the password that matches the stored hash', async () => {
      const user = registerAna();

      const authenticated = await user.authenticate(
        Password.create('agil2026'),
        prefixVerifier,
      );

      expect(authenticated).toBe(true);
    });

    it('should refuse a different password', async () => {
      const user = registerAna();

      const authenticated = await user.authenticate(
        Password.create('errada123'),
        prefixVerifier,
      );

      expect(authenticated).toBe(false);
    });
  });
});
