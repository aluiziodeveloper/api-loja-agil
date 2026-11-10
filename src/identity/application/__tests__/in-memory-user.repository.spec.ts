import { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import { aUser } from '../../domain/__tests__/user.builder.js';
import { Email } from '../../domain/email.value-object.js';
import { Name } from '../../domain/name.value-object.js';
import { InMemoryUserRepository } from './in-memory-user.repository.js';

describe('InMemoryUserRepository', () => {
  let repository: InMemoryUserRepository;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
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

  it('should list and delete users', async () => {
    const ana = aUser().build();
    const bruno = aUser().build();
    await repository.save(ana);
    await repository.save(bruno);

    await repository.delete(ana.id);

    const users = await repository.findAll();
    expect(users.map((user) => user.id.toString())).toEqual([
      bruno.id.toString(),
    ]);
  });
});
