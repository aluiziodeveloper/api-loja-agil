import { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import { aUser } from '../../domain/__tests__/user.builder.js';
import type { User } from '../../domain/user.entity.js';
import { WeakPasswordError } from '../../domain/weak-password.error.js';
import { FakePasswordHasher } from '../__tests__/fake-password-hasher.js';
import { InMemoryUserRepository } from '../__tests__/in-memory-user.repository.js';
import { IncorrectCurrentPasswordError } from '../errors/incorrect-current-password.error.js';
import { UserNotFoundError } from '../errors/user-not-found.error.js';
import { ChangePasswordUseCase } from './change-password.use-case.js';

describe('ChangePasswordUseCase', () => {
  let users: InMemoryUserRepository;
  let changePassword: ChangePasswordUseCase;
  let ana: User;

  beforeEach(async () => {
    users = new InMemoryUserRepository();
    changePassword = new ChangePasswordUseCase(users, new FakePasswordHasher());
    ana = aUser().withPasswordHash('hashed:agil2026').build();
    await users.save(ana);
  });

  async function storedHash() {
    const stored = await users.findById(ana.id);
    return stored?.toSnapshot().passwordHash;
  }

  it('should store the hash of the new password', async () => {
    await changePassword.execute({
      userId: ana.id.toString(),
      currentPassword: 'agil2026',
      newPassword: 'nova2026',
    });

    expect(await storedHash()).toBe('hashed:nova2026');
  });

  it.each(['errada123', '123'])(
    'should reject the incorrect current password "%s"',
    async (currentPassword) => {
      await expect(
        changePassword.execute({
          userId: ana.id.toString(),
          currentPassword,
          newPassword: 'nova2026',
        }),
      ).rejects.toThrow(IncorrectCurrentPasswordError);
      expect(await storedHash()).toBe('hashed:agil2026');
    },
  );

  it('should reject a weak new password', async () => {
    await expect(
      changePassword.execute({
        userId: ana.id.toString(),
        currentPassword: 'agil2026',
        newPassword: 'fraca',
      }),
    ).rejects.toThrow(WeakPasswordError);
    expect(await storedHash()).toBe('hashed:agil2026');
  });

  it('should report the INCORRECT_CURRENT_PASSWORD code', async () => {
    await expect(
      changePassword.execute({
        userId: ana.id.toString(),
        currentPassword: 'errada123',
        newPassword: 'nova2026',
      }),
    ).rejects.toMatchObject({
      code: 'INCORRECT_CURRENT_PASSWORD',
      message: 'A senha atual está incorreta.',
    });
  });

  it('should fail when the user does not exist', async () => {
    await expect(
      changePassword.execute({
        userId: UniqueId.create().toString(),
        currentPassword: 'agil2026',
        newPassword: 'nova2026',
      }),
    ).rejects.toThrow(UserNotFoundError);
  });
});
