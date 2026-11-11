/**
 * Uma loja pronta para explorar a API em desenvolvimento. A senha é a mesma
 * para todos de propósito: estes dados nunca vão para produção.
 */
const PASSWORD = 'caneca123';

export const DEMO_STORE = {
  operator: {
    name: 'Olga Operadora',
    email: 'olga@loja.dev',
    password: PASSWORD,
  },
  customers: [
    { name: 'Ana Souza', email: 'ana@loja.dev', password: PASSWORD },
    { name: 'Bruno Lima', email: 'bruno@loja.dev', password: PASSWORD },
  ],
  products: [
    {
      sku: 'CAN001',
      name: 'Caneca Ágil',
      priceInCents: 4590,
      onHand: 20,
      minimumLevel: 5,
    },
    {
      sku: 'CAM001',
      name: 'Camiseta Scrum',
      priceInCents: 7990,
      onHand: 10,
      minimumLevel: 3,
    },
    {
      sku: 'ADE001',
      name: 'Adesivo Kanban',
      priceInCents: 990,
      onHand: 100,
      minimumLevel: 20,
    },
    // Abaixo do mínimo desde o começo, para o alerta de estoque aparecer.
    {
      sku: 'BON001',
      name: 'Boné Sprint',
      priceInCents: 3990,
      onHand: 2,
      minimumLevel: 5,
    },
  ],
  coupons: [
    {
      code: 'AGIL10',
      discount: { type: 'PERCENTAGE' as const, percent: 10, capInCents: 5000 },
      minimumOrderInCents: 5000,
      expiresAt: new Date('2099-12-31T23:59:59.000Z'),
    },
  ],
};
