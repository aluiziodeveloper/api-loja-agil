import { PrismaDatabase } from '../../src/shared/infrastructure/database/prisma-database.js';
import { useTestApp } from '../setup/e2e.js';

describe('POST /users (e2e)', () => {
  const e2e = useTestApp();
  const api = e2e.api;

  const signUp = (payload: object) => api.post('/users', payload);

  it('should register a customer and answer 201 without the password', async () => {
    const response = await signUp({
      name: 'Ana Souza',
      email: 'ana@loja.dev',
      password: 'caneca123',
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      data: {
        id: expect.any(String),
        name: 'Ana Souza',
        email: 'ana@loja.dev',
        role: 'CUSTOMER',
      },
    });
  });

  it('should store a scrypt hash, never the password', async () => {
    await signUp({
      name: 'Ana Souza',
      email: 'ana@loja.dev',
      password: 'caneca123',
    });

    const user = await e2e.app
      .get(PrismaDatabase)
      .client()
      .user.findUniqueOrThrow({ where: { email: 'ana@loja.dev' } });
    expect(user.passwordHash).toMatch(/^scrypt\$/);
    expect(user.passwordHash).not.toContain('caneca123');
  });

  it('should ignore fields the client must not choose', async () => {
    const response = await signUp({
      name: 'Ana Souza',
      email: 'ana@loja.dev',
      password: 'caneca123',
      role: 'OPERATOR',
    });

    expect(response.json()).toMatchObject({ data: { role: 'CUSTOMER' } });
  });

  it('should answer 400 listing the fields that are missing or of another type', async () => {
    const response = await signUp({ name: 123, password: true });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: 'VALIDATION_FAILED',
        message: 'A requisição tem campos inválidos.',
        details: [
          { path: 'name', message: expect.any(String) },
          { path: 'email', message: expect.any(String) },
          { path: 'password', message: expect.any(String) },
        ],
      },
    });
  });

  it('should answer 400 with the code of the broken rule', async () => {
    const response = await signUp({
      name: 'Ana Souza',
      email: 'ana@loja.dev',
      password: 'curta',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: 'WEAK_PASSWORD',
        message:
          'A senha deve ter entre 8 e 128 caracteres, com letras e números.',
      },
    });
  });

  it('should answer 409 to an e-mail already in use', async () => {
    const ana = {
      name: 'Ana Souza',
      email: 'ana@loja.dev',
      password: 'caneca123',
    };
    await signUp(ana);

    const response = await signUp({ ...ana, name: 'Ana Lima' });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({
      error: { code: 'EMAIL_ALREADY_IN_USE' },
    });
  });
});
