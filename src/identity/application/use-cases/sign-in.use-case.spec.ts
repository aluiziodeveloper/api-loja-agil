import { aUser } from '../../domain/__tests__/user.builder.js';
import { FakePasswordHasher } from '../__tests__/fake-password-hasher.js';
import { InMemoryUserRepository } from '../__tests__/in-memory-user.repository.js';
import { InvalidCredentialsError } from '../errors/invalid-credentials.error.js';
import { SignInUseCase } from './sign-in.use-case.js';

describe('SignInUseCase', () => {
  let signIn: SignInUseCase;

  beforeEach(async () => {
    const users = new InMemoryUserRepository();
    await users.save(
      aUser()
        .withName('Ana Silva')
        .withEmail('ana@lojaagil.com')
        .withPasswordHash('hashed:agil2026')
        .build(),
    );
    signIn = new SignInUseCase(users, new FakePasswordHasher());
  });

  it('should return the user when email and password match', async () => {
    const output = await signIn.execute({
      email: 'ANA@lojaagil.com',
      password: 'agil2026',
    });

    expect(output).toMatchObject({
      name: 'Ana Silva',
      email: 'ana@lojaagil.com',
    });
  });

  it.each([
    ['the password is wrong', 'ana@lojaagil.com', 'errada123'],
    ['the email is unknown', 'bia@lojaagil.com', 'agil2026'],
    ['the email is malformed', 'ana', 'agil2026'],
    ['the password breaks the policy', 'ana@lojaagil.com', '123'],
  ])('should give the same answer when %s', async (_, email, password) => {
    await expect(signIn.execute({ email, password })).rejects.toThrow(
      new InvalidCredentialsError(),
    );
  });

  it('should report the INVALID_CREDENTIALS code', async () => {
    await expect(
      signIn.execute({ email: 'ana@lojaagil.com', password: 'errada123' }),
    ).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
      message: 'E-mail ou senha inválidos.',
    });
  });
});
