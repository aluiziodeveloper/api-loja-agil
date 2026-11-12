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

  it('should return an empty page when there are no users', async () => {
    expect(await listUsers.execute({})).toEqual({
      items: [],
      total: 0,
      page: 1,
      perPage: 15,
      lastPage: 1,
    });
  });

  it('should list every user sorted by name, without passwords', async () => {
    await users.save(aUser().withName('Carla Dias').build());
    await users.save(
      aUser().withName('Ana Silva').withRole(Role.OPERATOR).build(),
    );
    await users.save(aUser().withName('Álvaro Lima').build());

    const { items: output } = await listUsers.execute({});

    expect(output.map((user) => user.name)).toEqual([
      'Álvaro Lima',
      'Ana Silva',
      'Carla Dias',
    ]);
    expect(output[1]).toMatchObject({ role: 'OPERATOR' });
    expect(output[0]).not.toHaveProperty('passwordHash');
  });

  it('should pass the page, the sort and the filter to the search', async () => {
    for (const [name, email] of [
      ['Ana Silva', 'ana@lojaagil.com'],
      ['Bruno Lima', 'bruno@lojaagil.com'],
      ['Carla Dias', 'carla@lojaagil.com'],
    ]) {
      await users.save(
        aUser().withName(`${name}`).withEmail(`${email}`).build(),
      );
    }

    const page = await listUsers.execute({
      perPage: 1,
      sortDirection: 'desc',
      filter: 'n',
    });

    expect(page.items.map((user) => user.name)).toEqual(['Bruno Lima']);
    expect(page).toMatchObject({ total: 2, lastPage: 2 });
  });
});
