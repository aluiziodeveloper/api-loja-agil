import { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import { aUser } from '../../domain/__tests__/user.builder.js';
import { InMemoryUserRepository } from '../__tests__/in-memory-user.repository.js';
import { UserNotFoundError } from '../errors/user-not-found.error.js';
import { GetProfileUseCase } from './get-profile.use-case.js';

describe('GetProfileUseCase', () => {
  let users: InMemoryUserRepository;
  let getProfile: GetProfileUseCase;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    getProfile = new GetProfileUseCase(users);
  });

  it('should return the profile of the given user', async () => {
    const user = aUser().withName('Ana Silva').build();
    await users.save(user);

    const output = await getProfile.execute({ userId: user.id.toString() });

    expect(output).toEqual({
      id: user.id.toString(),
      name: 'Ana Silva',
      email: user.toSnapshot().email,
      role: 'CUSTOMER',
    });
  });

  it('should fail when the user does not exist', async () => {
    const userId = UniqueId.create().toString();

    const result = getProfile.execute({ userId });

    await expect(result).rejects.toThrow(UserNotFoundError);
    await expect(result).rejects.toMatchObject({
      code: 'USER_NOT_FOUND',
      message: 'Usuário não encontrado.',
    });
  });
});
