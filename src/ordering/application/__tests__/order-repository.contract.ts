import { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import { Sku } from '../../../shared/domain/sku.value-object.js';
import { aCoupon } from '../../domain/__tests__/coupon.builder.js';
import { anOrder } from '../../domain/__tests__/order.builder.js';
import { orderSearchParams } from '../order-search.js';
import type { OrderRepository } from '../ports/order.repository.js';

const CUSTOMER_ID = '01890a5d-ac96-774b-bcce-b302099a8057';
const OTHER_CUSTOMER_ID = '01890a5d-ac96-774b-bcce-b302099a8059';
const LOWER_ID = '01890a5d-ac96-774b-bcce-b302099a8061';
const HIGHER_ID = '01890a5d-ac96-774b-bcce-b302099a8062';

function at(day: number): Date {
  return new Date(Date.UTC(2026, 10, day, 12));
}

/** O comportamento que toda implementação de `OrderRepository` precisa ter. */
export function orderRepositoryContract(
  createRepository: () => Promise<OrderRepository>,
): void {
  let orders: OrderRepository;

  beforeEach(async () => {
    orders = await createRepository();
  });

  it('should find a saved order by id, as a new instance', async () => {
    const order = anOrder().build();
    await orders.save(order);

    const found = await orders.findById(order.id);

    expect(found).not.toBe(order);
    expect(found?.toSnapshot()).toEqual(order.toSnapshot());
    expect(await orders.findById(UniqueId.create())).toBeNull();
  });

  it('should only keep changes after they are saved', async () => {
    const order = anOrder().build();
    await orders.save(order);

    order.place();

    expect((await orders.findById(order.id))?.toSnapshot().status).toBe(
      'DRAFT',
    );
  });

  it('should list the orders of a customer, newest first', async () => {
    const oldest = anOrder()
      .withCustomerId(CUSTOMER_ID)
      .withCreatedAt(at(1))
      .build();
    const newest = anOrder()
      .withCustomerId(CUSTOMER_ID)
      .withCreatedAt(at(9))
      .build();
    const someoneElses = anOrder().withCustomerId(OTHER_CUSTOMER_ID).build();
    for (const order of [oldest, someoneElses, newest]) {
      await orders.save(order);
    }

    const result = await orders.listByCustomer(
      UniqueId.from(CUSTOMER_ID),
      orderSearchParams({}),
    );

    expect(result.toOutput().items.map((order) => order.id)).toEqual([
      newest.id,
      oldest.id,
    ]);
    expect(result.toOutput().total).toBe(2);
  });

  it('should break ties by id, in the requested direction', async () => {
    const sameInstant = at(5);
    for (const id of [HIGHER_ID, LOWER_ID]) {
      await orders.save(
        anOrder()
          .withId(id)
          .withCustomerId(CUSTOMER_ID)
          .withCreatedAt(sameInstant)
          .build(),
      );
    }

    const ids = async (sortDirection: string) =>
      (
        await orders.listByCustomer(
          UniqueId.from(CUSTOMER_ID),
          orderSearchParams({ sortDirection }),
        )
      )
        .toOutput()
        .items.map((order) => order.id.toString());

    expect(await ids('asc')).toEqual([LOWER_ID, HIGHER_ID]);
    expect(await ids('desc')).toEqual([HIGHER_ID, LOWER_ID]);
  });

  it('should keep the items in the order they were added, and the coupon copy', async () => {
    const order = anOrder()
      .withItems(
        { sku: 'XIC001', unitPriceInCents: 2990, quantity: 1 },
        { sku: 'CAN001', unitPriceInCents: 4990, quantity: 3 },
        { sku: 'BON001', unitPriceInCents: 5990, quantity: 2 },
      )
      .withCoupon(aCoupon().withCode('NATAL2026').build().toSnapshot())
      .build();
    await orders.save(order);

    const found = await orders.findById(order.id);

    expect(found?.toSnapshot()).toEqual(order.toSnapshot());
  });

  it('should replace the items when saving again', async () => {
    const order = anOrder()
      .withItems(
        { sku: 'CAN001', unitPriceInCents: 4990, quantity: 3 },
        { sku: 'BON001', unitPriceInCents: 5990, quantity: 2 },
      )
      .build();
    await orders.save(order);

    order.removeItem(Sku.create('CAN001'));
    await orders.save(order);

    const found = await orders.findById(order.id);
    expect(found?.toSnapshot().items.map((item) => item.sku)).toEqual([
      'BON001',
    ]);
  });
}
