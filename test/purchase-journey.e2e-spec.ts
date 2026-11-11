import { OPERATOR } from './setup/auth.js';
import { useTestApp } from './setup/e2e.js';
import { givenProduct, MUG } from './setup/scenarios.js';
import { dataOf, type TestResponse } from './setup/test-client.js';

type Order = { id: string; status: string; totalInCents: number };

type Stock = { onHand: number; reserved: number; belowMinimum: boolean };

/**
 * A loja inteira numa história só, como um usuário a vive: cada passo
 * depende do anterior, e o estoque é conferido no caminho. Os outros e2e
 * provam cada rota; este prova que elas se encaixam.
 */
describe('Purchase journey (e2e)', () => {
  const e2e = useTestApp();
  const visitor = e2e.api;
  const operator = e2e.as(OPERATOR);

  const stock = async () =>
    dataOf<Stock>(await operator.get(`/stock/${MUG.sku}`));

  const order = (response: TestResponse) => dataOf<Order>(response);

  it('should take a customer from sign-up to a shipped order', async () => {
    // A loja se prepara: produto, estoque, estoque mínimo e um cupom.
    await givenProduct(operator, MUG, 5);
    await operator.put(`/stock/${MUG.sku}/minimum-level`, { minimumLevel: 4 });
    await operator.post('/coupons', {
      code: 'AGIL10',
      discount: { type: 'PERCENTAGE', percent: 10, capInCents: 5000 },
      minimumOrderInCents: 5000,
      expiresAt: '2099-12-31T23:59:59.000Z',
    });

    // Um visitante encontra o produto, sem conta.
    const catalog = await visitor.get('/products?q=caneca');
    expect(dataOf<{ sku: string }[]>(catalog)).toEqual([
      expect.objectContaining({ sku: MUG.sku }),
    ]);

    // Ele se cadastra e entra.
    await visitor.post('/users', {
      name: 'Ana Souza',
      email: 'ana@loja.dev',
      password: 'caneca123',
    });
    const signIn = await visitor.post('/auth/sign-in', {
      email: 'ana@loja.dev',
      password: 'caneca123',
    });
    const ana = e2e.bearer(dataOf<{ accessToken: string }>(signIn).accessToken);

    // Monta o pedido: duas canecas e o cupom.
    const { id } = order(await ana.post('/orders'));
    await ana.post(`/orders/${id}/items`, { sku: MUG.sku, quantity: 2 });
    const withCoupon = order(
      await ana.put(`/orders/${id}/coupon`, { code: 'AGIL10' }),
    );
    expect(withCoupon.totalInCents).toBe(8262);

    // Confirma: o estoque reserva as duas unidades.
    expect(order(await ana.post(`/orders/${id}/place`)).status).toBe('PLACED');
    expect(await stock()).toMatchObject({ onHand: 5, reserved: 2 });

    // Paga: as unidades saem do estoque, que cruza o mínimo.
    expect(order(await ana.post(`/orders/${id}/pay`)).status).toBe('PAID');
    expect(await stock()).toMatchObject({
      onHand: 3,
      reserved: 0,
      belowMinimum: true,
    });

    // A loja despacha, e o cliente vê o pedido enviado.
    const shipped = await operator.post(`/orders/${id}/ship`);
    expect(order(shipped).status).toBe('SHIPPED');
    expect(dataOf<Order[]>(await ana.get('/orders'))).toEqual([
      expect.objectContaining({ id, status: 'SHIPPED', totalInCents: 8262 }),
    ]);

    // O histórico do estoque conta a mesma história, do fim para o começo.
    const history = await operator.get(
      `/stock/${MUG.sku}/movements?sortDirection=desc`,
    );
    expect(dataOf<{ type: string }[]>(history).map(({ type }) => type)).toEqual(
      ['COMMIT', 'RESERVATION', 'RECEIPT'],
    );
  });
});
