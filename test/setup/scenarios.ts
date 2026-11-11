import { dataOf, type TestClient } from './test-client.js';

/**
 * Os dados de cada teste entram pela porta da frente, a API, como entrariam
 * em produção. Um cenário que só o repositório consegue montar é um cenário
 * que nenhum usuário consegue alcançar.
 */
export const MUG = { sku: 'CAN001', name: 'Caneca Ágil', priceInCents: 4590 };

type NewProduct = typeof MUG;

type NewUser = { name: string; email: string; password: string };

type OrderLine = { sku: string; quantity: number };

/** Um produto no catálogo, com `onHand` unidades no estoque; devolve o id dele. */
export async function givenProduct(
  operator: TestClient,
  product: NewProduct = MUG,
  onHand = 0,
): Promise<string> {
  const created = await operator.post('/products', product);
  if (onHand > 0) {
    await operator.post(`/stock/${product.sku}/receipts`, { quantity: onHand });
  }
  return dataOf<{ id: string }>(created).id;
}

/** Um rascunho do cliente com esses itens; devolve o id do pedido. */
export async function givenDraft(
  customer: TestClient,
  lines: OrderLine[],
): Promise<string> {
  const { id } = dataOf<{ id: string }>(await customer.post('/orders'));
  for (const line of lines) {
    await customer.post(`/orders/${id}/items`, line);
  }
  return id;
}

/** Um usuário cadastrado pela rota pública; devolve o id dele. */
export async function givenUser(
  api: TestClient,
  user: NewUser,
): Promise<string> {
  return dataOf<{ id: string }>(await api.post('/users', user)).id;
}
