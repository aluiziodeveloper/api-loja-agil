import { OPERATOR } from '../setup/auth.js';
import { useTestApp } from '../setup/e2e.js';
import { givenUser } from '../setup/scenarios.js';

describe('GET /users (e2e)', () => {
  const e2e = useTestApp();
  const operator = e2e.as(OPERATOR);

  const signUp = (name: string, email: string) =>
    givenUser(e2e.api, { name, email, password: 'caneca123' });

  it('should list the users in alphabetical order', async () => {
    await signUp('Bruno Lima', 'bruno@loja.dev');
    await signUp('Ana Souza', 'ana@loja.dev');

    const response = await operator.get('/users');

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: [
        expect.objectContaining({ name: 'Ana Souza' }),
        expect.objectContaining({ name: 'Bruno Lima' }),
      ],
      meta: { total: 2, page: 1, perPage: 15, lastPage: 1 },
    });
  });

  it('should page, sort and filter the users', async () => {
    await signUp('Bruno Lima', 'bruno@loja.dev');
    await signUp('Ana Souza', 'ana@loja.dev');
    await signUp('Carla Dias', 'carla@outra.dev');

    const response = await operator.get(
      '/users?filter=loja.dev&sort=email&sortDirection=desc&perPage=1',
    );

    expect(response.json()).toEqual({
      data: [expect.objectContaining({ name: 'Bruno Lima' })],
      meta: { total: 2, page: 1, perPage: 1, lastPage: 2 },
    });
  });

  it('should refuse a sort field that is not offered', async () => {
    const response = await operator.get('/users?sort=password');

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: { code: 'INVALID_SEARCH_PARAMS' },
    });
  });

  it('should find a user by id', async () => {
    const id = await signUp('Ana Souza', 'ana@loja.dev');

    const response = await operator.get(`/users/${id}`);

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: { id, name: 'Ana Souza', email: 'ana@loja.dev', role: 'CUSTOMER' },
    });
  });

  it('should answer 404 to an id nobody has', async () => {
    const response = await operator.get(
      '/users/0b6f1c1e-3c55-4a4f-9a8e-2d8f6f7b9c10',
    );

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      error: { code: 'USER_NOT_FOUND' },
    });
  });

  it('should answer 400 to an id that is not a UUID', async () => {
    const response = await operator.get('/users/42');

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ error: { code: 'INVALID_ID' } });
  });
});
