import { aUser } from '../../domain/__tests__/user.builder.js';
import { InMemoryUserRepository } from '../__tests__/in-memory-user.repository.js';
import { UserNotFoundError } from '../errors/user-not-found.error.js';
import { PromoteToOperatorUseCase } from './promote-to-operator.use-case.js';

describe('PromoteToOperatorUseCase', () => {
  let users: InMemoryUserRepository;
  let promote: PromoteToOperatorUseCase;

  beforeEach(async () => {
    users = new InMemoryUserRepository();
    await users.save(
      aUser().withName('Ana Silva').withEmail('ana@lojaagil.com').build(),
    );
    promote = new PromoteToOperatorUseCase(users);
  });

  it('should make the user with that e-mail an operator', async () => {
    const output = await promote.execute({ email: 'ANA@lojaagil.com' });

    expect(output).toMatchObject({ name: 'Ana Silva', role: 'OPERATOR' });
    const [stored] = users.all();
    expect(stored.toSnapshot().role).toBe('OPERATOR');
  });

  it('should fail for an e-mail nobody uses', async () => {
    await expect(
      promote.execute({ email: 'bia@lojaagil.com' }),
    ).rejects.toThrow(UserNotFoundError);
  });
});
