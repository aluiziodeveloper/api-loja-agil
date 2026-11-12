import type { SearchParamsInput } from '../../../shared/application/search/search-params.js';
import { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import { aUser } from '../../domain/__tests__/user.builder.js';
import { Email } from '../../domain/email.value-object.js';
import { Name } from '../../domain/name.value-object.js';
import type { UserRepository } from '../ports/user.repository.js';
import { userSearchParams } from '../user-search.js';

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

  it('should delete only the given user', async () => {
    const [ana, bruno] = [aUser().build(), aUser().build()];
    await repository.save(ana);
    await repository.save(bruno);

    await repository.delete(ana.id);

    expect(await repository.findById(ana.id)).toBeNull();
    expect(await repository.findById(bruno.id)).not.toBeNull();
  });

  it('should ignore the deletion of a user that does not exist', async () => {
    await expect(repository.delete(UniqueId.create())).resolves.toBeUndefined();
  });

  describe('search', () => {
    const people = [
      ['Bruno Lima', 'bruno@lojaagil.com'],
      ['Ágata Reis', 'agata@lojaagil.com'],
      ['Carla Dias', 'carla@outra.com'],
      ['Ana Souza', 'zeca@lojaagil.com'],
    ];

    beforeEach(async () => {
      for (const [name = '', email = ''] of people) {
        await repository.save(aUser().withName(name).withEmail(email).build());
      }
    });

    async function namesOf(input: SearchParamsInput): Promise<string[]> {
      const result = await repository.search(userSearchParams(input));
      return result.toOutput().items.map((user) => user.toSnapshot().name);
    }

    it('should sort by name in Portuguese by default', async () => {
      expect(await namesOf({})).toEqual([
        'Ágata Reis',
        'Ana Souza',
        'Bruno Lima',
        'Carla Dias',
      ]);
    });

    it('should sort by email when asked', async () => {
      expect(await namesOf({ sort: 'email', sortDirection: 'desc' })).toEqual([
        'Ana Souza',
        'Carla Dias',
        'Bruno Lima',
        'Ágata Reis',
      ]);
    });

    it('should filter by name or email, ignoring case', async () => {
      expect(await namesOf({ filter: 'SOUZA' })).toEqual(['Ana Souza']);
      expect(await namesOf({ filter: 'outra.com' })).toEqual(['Carla Dias']);
    });

    it('should treat % and _ in the filter as plain text', async () => {
      await repository.save(
        aUser().withName('Ana Lima').withEmail('ana_lima@lojaagil.com').build(),
      );
      await repository.save(
        aUser().withName('Ana Lins').withEmail('anaxlima@lojaagil.com').build(),
      );

      expect(await namesOf({ filter: 'ana_lima' })).toEqual(['Ana Lima']);
      expect(await namesOf({ filter: '%' })).toEqual([]);
    });

    it('should break ties by id, so that pages never repeat a user', async () => {
      const [lower, higher] = [
        '019a6b7e-0000-7000-8000-000000000001',
        '019a6b7e-0000-7000-8000-000000000002',
      ];
      for (const [id, email] of [
        [higher, 'davi.2@lojaagil.com'],
        [lower, 'davi.1@lojaagil.com'],
      ]) {
        await repository.save(
          aUser()
            .withId(`${id}`)
            .withName('Davi Rocha')
            .withEmail(`${email}`)
            .build(),
        );
      }

      const result = await repository.search(
        userSearchParams({ filter: 'davi' }),
      );

      expect(result.toOutput().items.map((user) => user.id.toString())).toEqual(
        [lower, higher],
      );
    });

    it('should find accents only when they are typed', async () => {
      expect(await namesOf({ filter: 'ágata' })).toEqual(['Ágata Reis']);
      expect(await namesOf({ filter: 'gata r' })).toEqual(['Ágata Reis']);
      expect(await namesOf({ filter: 'agata r' })).toEqual([]);
    });

    it('should return an empty page beyond the last one', async () => {
      const result = await repository.search(userSearchParams({ page: 9 }));

      expect(result.toOutput()).toMatchObject({
        items: [],
        total: 4,
        lastPage: 1,
      });
    });

    it('should cut the requested page and count every match', async () => {
      const result = await repository.search(
        userSearchParams({ page: 2, perPage: 3 }),
      );

      expect(result.toOutput()).toMatchObject({
        total: 4,
        page: 2,
        perPage: 3,
        lastPage: 2,
      });
      expect(result.toOutput().items).toHaveLength(1);
    });
  });
}
