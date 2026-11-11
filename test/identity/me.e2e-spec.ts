import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { PrismaDatabase } from '../../src/shared/infrastructure/database/prisma-database.js';
import { resetDatabase } from '../../src/shared/infrastructure/database/__tests__/reset-database.js';
import { createTestApp } from '../setup/create-test-app.js';

describe('/me (e2e)', () => {
  let app: NestFastifyApplication;
  let ana: { authorization: string };

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase(app.get(PrismaDatabase));
    await app.inject({
      method: 'POST',
      url: '/users',
      payload: {
        name: 'Ana Souza',
        email: 'ana@loja.dev',
        password: 'caneca123',
      },
    });
    ana = await signIn('caneca123');
  });

  afterAll(async () => {
    await app.close();
  });

  async function signIn(password: string): Promise<{ authorization: string }> {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/sign-in',
      payload: { email: 'ana@loja.dev', password },
    });
    const { accessToken } = response.json<{ data: { accessToken: string } }>()
      .data;
    return { authorization: `Bearer ${accessToken}` };
  }

  const me = () => app.inject({ method: 'GET', url: '/me', headers: ana });

  it('should answer the profile of the user of the token', async () => {
    const response = await me();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      data: { name: 'Ana Souza', email: 'ana@loja.dev', role: 'CUSTOMER' },
    });
  });

  it('should update the name and the e-mail', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/me',
      headers: ana,
      payload: { name: 'Ana Lima' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ data: { name: 'Ana Lima' } });
  });

  it('should refuse a role in the profile instead of ignoring it', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/me',
      headers: ana,
      payload: { role: 'OPERATOR' },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: { code: 'VALIDATION_FAILED' },
    });
    expect((await me()).json()).toMatchObject({ data: { role: 'CUSTOMER' } });
  });

  it('should change the password, so only the new one signs in', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: '/me/password',
      headers: ana,
      payload: { currentPassword: 'caneca123', newPassword: 'xicara456' },
    });

    expect(response.statusCode).toBe(204);
    await expect(signIn('xicara456')).resolves.toBeDefined();
    const old = await app.inject({
      method: 'POST',
      url: '/auth/sign-in',
      payload: { email: 'ana@loja.dev', password: 'caneca123' },
    });
    expect(old.statusCode).toBe(401);
  });

  it('should answer 422 to a wrong current password', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: '/me/password',
      headers: ana,
      payload: { currentPassword: 'errada123', newPassword: 'xicara456' },
    });

    expect(response.statusCode).toBe(422);
    expect(response.json()).toMatchObject({
      error: { code: 'INCORRECT_CURRENT_PASSWORD' },
    });
  });

  it('should delete the account; the token still valid finds nobody', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/me',
      headers: ana,
    });

    expect(response.statusCode).toBe(204);
    const after = await me();
    expect(after.statusCode).toBe(404);
    expect(after.json()).toMatchObject({ error: { code: 'USER_NOT_FOUND' } });
  });
});
