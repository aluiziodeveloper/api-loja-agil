import { aUser } from '../../domain/__tests__/user.builder.js';
import { Role } from '../../domain/role.js';
import { InMemoryUserRepository } from '../__tests__/in-memory-user.repository.js';
import { ListUsersUseCase } from './list-users.use-case.js';

describe('ListUsersUseCase', () => {
  let users: InMemoryUserRepository;
  let listUsers: ListUsersUseCase;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    listUsers = new ListUsersUseCase(users);
  });

  it('should return an empty list when there are no users', async () => {
    expect(await listUsers.execute()).toEqual([]);
  });

  it('should list every user sorted by name, without passwords', async () => {
    await users.save(aUser().withName('Carla Dias').build());
    await users.save(
      aUser().withName('Ana Silva').withRole(Role.OPERATOR).build(),
    );
    await users.save(aUser().withName('Álvaro Lima').build());

    const output = await listUsers.execute();

    expect(output.map((user) => user.name)).toEqual([
      'Álvaro Lima',
      'Ana Silva',
      'Carla Dias',
    ]);
    expect(output[1]).toMatchObject({ role: 'OPERATOR' });
    expect(output[0]).not.toHaveProperty('passwordHash');
  });
});
