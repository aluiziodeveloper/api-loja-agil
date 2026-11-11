import { CreateProductUseCase } from '../catalog/application/use-cases/create-product.use-case.js';
import { PromoteToOperatorUseCase } from '../identity/application/use-cases/promote-to-operator.use-case.js';
import { SignUpUseCase } from '../identity/application/use-cases/sign-up.use-case.js';
import { ChangeMinimumLevelUseCase } from '../inventory/application/use-cases/change-minimum-level.use-case.js';
import { ReceiveStockUseCase } from '../inventory/application/use-cases/receive-stock.use-case.js';
import { CreateCouponUseCase } from '../ordering/application/use-cases/create-coupon.use-case.js';
import { DomainError } from '../shared/domain/domain-error.js';
import { DEMO_STORE } from './demo-store.js';

/** Como o `app.get` do Nest: a classe do caso de uso entra, a instância sai. */
export type Resolve = <Service>(
  type: new (...args: never[]) => Service,
) => Service;

/** Os erros que querem dizer "já está lá": o seed pode rodar quantas vezes for preciso. */
const ALREADY_THERE = new Set([
  'EMAIL_ALREADY_IN_USE',
  'SKU_ALREADY_IN_USE',
  'COUPON_CODE_IN_USE',
]);

function isAlreadyThere(error: unknown): boolean {
  return error instanceof DomainError && ALREADY_THERE.has(error.code);
}

/** Cria, ou conta que já estava lá; qualquer outro erro sobe. */
function once(label: string, create: () => Promise<unknown>): Promise<string> {
  return create().then(
    () => `${label}: criado`,
    (error: unknown) => {
      if (!isAlreadyThere(error)) {
        throw error;
      }
      return `${label}: já existia`;
    },
  );
}

/** Um item de cada vez, na ordem: o relatório sai na ordem dos dados. */
async function eachOnce<Item>(
  items: readonly Item[],
  labelOf: (item: Item) => string,
  create: (item: Item) => Promise<unknown>,
): Promise<string[]> {
  const report: string[] = [];
  for (const item of items) {
    report.push(await once(labelOf(item), () => create(item)));
  }
  return report;
}

type DemoProduct = (typeof DEMO_STORE.products)[number];

/** O estoque entra junto com o produto: um produto que já existia não ganha unidades de novo. */
async function createProduct(
  resolve: Resolve,
  { onHand, minimumLevel, ...product }: DemoProduct,
): Promise<void> {
  const { sku } = product;
  await resolve(CreateProductUseCase).execute(product);
  await resolve(ReceiveStockUseCase).execute({ sku, quantity: onHand });
  await resolve(ChangeMinimumLevelUseCase).execute({ sku, minimumLevel });
}

async function createOperator(resolve: Resolve): Promise<void> {
  await resolve(SignUpUseCase).execute(DEMO_STORE.operator);
  await resolve(PromoteToOperatorUseCase).execute(DEMO_STORE.operator);
}

async function seedPeople(resolve: Resolve): Promise<string[]> {
  const { operator, customers } = DEMO_STORE;
  return [
    await once(`operador ${operator.email}`, () => createOperator(resolve)),
    ...(await eachOnce(
      customers,
      ({ email }) => `cliente ${email}`,
      (customer) => resolve(SignUpUseCase).execute(customer),
    )),
  ];
}

async function seedStore(resolve: Resolve): Promise<string[]> {
  const { products, coupons } = DEMO_STORE;
  return [
    ...(await eachOnce(
      products,
      ({ sku }) => `produto ${sku}`,
      (product) => createProduct(resolve, product),
    )),
    ...(await eachOnce(
      coupons,
      ({ code }) => `cupom ${code}`,
      (coupon) => resolve(CreateCouponUseCase).execute(coupon),
    )),
  ];
}

/** A loja de demonstração, montada pelos casos de uso, com as mesmas regras da API. */
export async function seedDemoStore(resolve: Resolve): Promise<string[]> {
  return [...(await seedPeople(resolve)), ...(await seedStore(resolve))];
}
