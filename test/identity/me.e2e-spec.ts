import { useTestApp } from '../setup/e2e.js';
import { givenUser } from '../setup/scenarios.js';
import { dataOf, type TestClient } from '../setup/test-client.js';

describe('/me (e2e)', () => {
  const e2e = useTestApp();
  const api = e2e.api;
  let ana: TestClient;

  beforeEach(async () => {
    await givenUser(api, {
      name: 'Ana Souza',
      email: 'ana@loja.dev',
      password: 'caneca123',
    });
    ana = await signIn('caneca123');
  });

  async function signIn(password: string): Promise<TestClient> {
    const response = await api.post('/auth/sign-in', {
      email: 'ana@loja.dev',
      password,
    });
    return e2e.bearer(dataOf<{ accessToken: string }>(response).accessToken);
  }

  const me = () => ana.get('/me');

  it('should answer the profile of the user of the token', async () => {
    const response = await me();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      data: { name: 'Ana Souza', email: 'ana@loja.dev', role: 'CUSTOMER' },
    });
  });

  it('should update the name and the e-mail', async () => {
    const response = await ana.patch('/me', {
      name: 'Ana Lima',
      email: 'ana.lima@loja.dev',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      data: { name: 'Ana Lima', email: 'ana.lima@loja.dev' },
    });
  });

  it('should refuse a role in the profile instead of ignoring it', async () => {
    const response = await ana.patch('/me', { role: 'OPERATOR' });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: { code: 'VALIDATION_FAILED' },
    });
    expect((await me()).json()).toMatchObject({ data: { role: 'CUSTOMER' } });
  });

  it('should change the password, so only the new one signs in', async () => {
    const response = await ana.put('/me/password', {
      currentPassword: 'caneca123',
      newPassword: 'xicara456',
    });

    expect(response.statusCode).toBe(204);
    await expect(signIn('xicara456')).resolves.toBeDefined();
    const old = await api.post('/auth/sign-in', {
      email: 'ana@loja.dev',
      password: 'caneca123',
    });
    expect(old.statusCode).toBe(401);
  });

  it('should answer 422 to a wrong current password', async () => {
    const response = await ana.put('/me/password', {
      currentPassword: 'errada123',
      newPassword: 'xicara456',
    });

    expect(response.statusCode).toBe(422);
    expect(response.json()).toMatchObject({
      error: { code: 'INCORRECT_CURRENT_PASSWORD' },
    });
  });

  it('should delete the account; the token still valid finds nobody', async () => {
    const response = await ana.delete('/me');

    expect(response.statusCode).toBe(204);
    const after = await me();
    expect(after.statusCode).toBe(404);
    expect(after.json()).toMatchObject({ error: { code: 'USER_NOT_FOUND' } });
  });
});
