import { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import { aUser } from '../../domain/__tests__/user.builder.js';
import { InMemoryUserRepository } from '../__tests__/in-memory-user.repository.js';
import { UserNotFoundError } from '../errors/user-not-found.error.js';
import { DeleteAccountUseCase } from './delete-account.use-case.js';

describe('DeleteAccountUseCase', () => {
  let users: InMemoryUserRepository;
  let deleteAccount: DeleteAccountUseCase;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    deleteAccount = new DeleteAccountUseCase(users);
  });

  it('should remove only the given user', async () => {
    const ana = aUser().build();
    const bruno = aUser().build();
    await users.save(ana);
    await users.save(bruno);

    await deleteAccount.execute({ userId: ana.id.toString() });

    expect(await users.findById(ana.id)).toBeNull();
    expect(await users.findById(bruno.id)).not.toBeNull();
  });

  it('should fail when the user does not exist', async () => {
    await expect(
      deleteAccount.execute({ userId: UniqueId.create().toString() }),
    ).rejects.toThrow(UserNotFoundError);
  });
});
