import { anOrder } from '../../domain/__tests__/order.builder.js';
import { InMemoryOrderRepository } from '../__tests__/in-memory-order.repository.js';
import { ListCustomerOrdersUseCase } from './list-customer-orders.use-case.js';

const CUSTOMER_ID = '01890a5d-ac96-774b-bcce-b302099a8057';

describe('ListCustomerOrdersUseCase', () => {
  it('should list the orders of a customer, newest first', async () => {
    const orders = new InMemoryOrderRepository();
    for (const day of [1, 3, 2]) {
      await orders.save(
        anOrder()
          .withCustomerId(CUSTOMER_ID)
          .withCreatedAt(new Date(Date.UTC(2026, 10, day)))
          .build(),
      );
    }
    await orders.save(anOrder().build());

    const output = await new ListCustomerOrdersUseCase(orders).execute({
      customerId: CUSTOMER_ID,
      perPage: 2,
    });

    expect(output.items.map((order) => order.createdAt)).toEqual([
      '2026-11-03T00:00:00.000Z',
      '2026-11-02T00:00:00.000Z',
    ]);
    expect(output).toMatchObject({
      total: 3,
      page: 1,
      perPage: 2,
      lastPage: 2,
    });
  });
});
