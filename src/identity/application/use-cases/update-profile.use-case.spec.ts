import { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import { aUser } from '../../domain/__tests__/user.builder.js';
import type { User } from '../../domain/user.entity.js';
import { InMemoryUserRepository } from '../__tests__/in-memory-user.repository.js';
import { EmailAlreadyInUseError } from '../errors/email-already-in-use.error.js';
import { UserNotFoundError } from '../errors/user-not-found.error.js';
import { UpdateProfileUseCase } from './update-profile.use-case.js';

describe('UpdateProfileUseCase', () => {
  let users: InMemoryUserRepository;
  let updateProfile: UpdateProfileUseCase;
  let ana: User;

  beforeEach(async () => {
    users = new InMemoryUserRepository();
    updateProfile = new UpdateProfileUseCase(users);
    ana = aUser().withName('Ana Silva').withEmail('ana@lojaagil.com').build();
    await users.save(ana);
  });

  async function storedAna() {
    const stored = await users.findById(ana.id);
    return stored?.toSnapshot();
  }

  it('should change only the name when only the name is given', async () => {
    const output = await updateProfile.execute({
      userId: ana.id.toString(),
      name: 'Ana Souza',
    });

    expect(output).toMatchObject({
      name: 'Ana Souza',
      email: 'ana@lojaagil.com',
    });
    expect(await storedAna()).toMatchObject({ name: 'Ana Souza' });
  });

  it('should change the email', async () => {
    await updateProfile.execute({
      userId: ana.id.toString(),
      email: 'ana.souza@lojaagil.com',
    });

    expect(await storedAna()).toMatchObject({
      name: 'Ana Silva',
      email: 'ana.souza@lojaagil.com',
    });
  });

  it('should accept the current email typed in another case', async () => {
    const output = await updateProfile.execute({
      userId: ana.id.toString(),
      email: 'ANA@lojaagil.com',
    });

    expect(output.email).toBe('ana@lojaagil.com');
  });

  it('should reject an email used by another user and keep the profile', async () => {
    await users.save(aUser().withEmail('bia@lojaagil.com').build());

    await expect(
      updateProfile.execute({
        userId: ana.id.toString(),
        name: 'Ana Souza',
        email: 'bia@lojaagil.com',
      }),
    ).rejects.toThrow(EmailAlreadyInUseError);
    expect(await storedAna()).toMatchObject({
      name: 'Ana Silva',
      email: 'ana@lojaagil.com',
    });
  });

  it('should fail when the user does not exist', async () => {
    await expect(
      updateProfile.execute({
        userId: UniqueId.create().toString(),
        name: 'Ninguém',
      }),
    ).rejects.toThrow(UserNotFoundError);
  });
});
