import { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import { aUser } from '../../domain/__tests__/user.builder.js';
import { Email } from '../../domain/email.value-object.js';
import { Name } from '../../domain/name.value-object.js';
import type { UserRepository } from '../ports/user.repository.js';

/**
 * O comportamento que toda implementação de `UserRepository` precisa ter. O
 * fake e o repositório do banco rodam estes mesmos testes: se o fake passa e o
 * banco não, o fake está mentindo para os testes dos casos de uso.
 */
export function userRepositoryContract(
  createRepository: () => Promise<UserRepository>,
): void {
  let repository: UserRepository;

  beforeEach(async () => {
    repository = await createRepository();
  });

  it('should find a saved user by id as a new instance', async () => {
    const user = aUser().build();
    await repository.save(user);

    const found = await repository.findById(user.id);

    expect(found).not.toBe(user);
    expect(found?.toSnapshot()).toEqual(user.toSnapshot());
  });

  it('should find a saved user by email', async () => {
    const user = aUser().withEmail('ana@lojaagil.com').build();
    await repository.save(user);

    const found = await repository.findByEmail(
      Email.create('ana@lojaagil.com'),
    );

    expect(found?.equals(user)).toBe(true);
  });

  it('should return null when nothing matches', async () => {
    expect(await repository.findById(UniqueId.create())).toBeNull();
    expect(
      await repository.findByEmail(Email.create('ninguem@lojaagil.com')),
    ).toBeNull();
  });

  it('should keep changes only after save', async () => {
    const user = aUser().withName('Ana Silva').build();
    await repository.save(user);

    user.rename(Name.create('Ana Souza'));
    const beforeSave = await repository.findById(user.id);
    await repository.save(user);
    const afterSave = await repository.findById(user.id);

    expect(beforeSave?.toSnapshot().name).toBe('Ana Silva');
    expect(afterSave?.toSnapshot().name).toBe('Ana Souza');
  });

  it('should list every user, in no particular order, and delete one', async () => {
    const [ana, bruno, carla] = [
      aUser().build(),
      aUser().build(),
      aUser().build(),
    ];
    for (const user of [ana, bruno, carla]) {
      await repository.save(user);
    }

    await repository.delete(ana.id);

    const ids = (await repository.findAll()).map((user) => user.id.toString());
    expect(ids.sort()).toEqual(
      [bruno.id.toString(), carla.id.toString()].sort(),
    );
  });
}
