import { randomUUID } from 'node:crypto';
import { customer, OPERATOR } from '../setup/auth.js';
import { useTestApp } from '../setup/e2e.js';
import { dataOf } from '../setup/test-client.js';

type Product = { id: string; active: boolean };

describe('Products (e2e)', () => {
  const e2e = useTestApp();
  const operator = e2e.as(OPERATOR);

  const caneca = { sku: 'CAN001', name: 'Caneca Ágil', priceInCents: 4590 };

  const create = (payload: object = caneca) =>
    operator.post('/products', payload);

  async function createdId(): Promise<string> {
    return dataOf<Product>(await create()).id;
  }

  it('should create a product and answer 201', async () => {
    const response = await create();

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      data: { id: expect.any(String), ...caneca, active: true },
    });
  });

  it('should answer 409 to a SKU already in use', async () => {
    await create();

    const response = await create({ ...caneca, name: 'Outra caneca' });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({
      error: { code: 'SKU_ALREADY_IN_USE' },
    });
  });

  it.each([
    ['INVALID_SKU', { ...caneca, sku: 'CANECA_AGIL' }],
    ['INVALID_PRODUCT_NAME', { ...caneca, name: 'C' }],
    ['INVALID_MONEY', { ...caneca, priceInCents: 45.9 }],
  ])('should answer 400 %s to a rule broken', async (code, payload) => {
    const response = await create(payload);

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ error: { code } });
  });

  it('should find a product by id', async () => {
    const id = await createdId();

    const response = await operator.get(`/products/${id}`);

    expect(response.json()).toEqual({ data: { id, ...caneca, active: true } });
  });

  it('should show an inactive product only to the operator', async () => {
    const id = await createdId();
    await operator.post(`/products/${id}/deactivate`);

    const toAnyone = await e2e.api.get(`/products/${id}`);
    const toACustomer = await e2e
      .as(customer(randomUUID()))
      .get(`/products/${id}`);
    const toTheOperator = await operator.get(`/products/${id}`);

    expect(toAnyone.statusCode).toBe(404);
    expect(toAnyone.json()).toMatchObject({
      error: { code: 'PRODUCT_NOT_FOUND' },
    });
    expect(toACustomer.statusCode).toBe(404);
    expect(dataOf<Product>(toTheOperator).active).toBe(false);
  });

  it('should change only what the PATCH brings', async () => {
    const id = await createdId();

    const response = await operator.patch(`/products/${id}`, {
      priceInCents: 3990,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      data: { name: 'Caneca Ágil', priceInCents: 3990 },
    });
  });

  it('should deactivate and activate again, answering 200', async () => {
    const id = await createdId();

    const deactivated = await operator.post(`/products/${id}/deactivate`);
    const activated = await operator.post(`/products/${id}/activate`);

    expect(deactivated.statusCode).toBe(200);
    expect(dataOf<Product>(deactivated).active).toBe(false);
    expect(dataOf<Product>(activated).active).toBe(true);
  });

  it('should answer 404 to a product nobody created', async () => {
    const response = await operator.post(
      '/products/0b6f1c1e-3c55-4a4f-9a8e-2d8f6f7b9c10/activate',
    );

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      error: { code: 'PRODUCT_NOT_FOUND' },
    });
  });
});
