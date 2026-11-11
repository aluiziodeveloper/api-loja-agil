import { anOrder } from '../../domain/__tests__/order.builder.js';
import { InMemoryOrderRepository } from '../__tests__/in-memory-order.repository.js';
import { RemoveOrderItemUseCase } from './remove-order-item.use-case.js';

const ORDER_ID = '01890a5d-ac96-774b-bcce-b302099a8058';
const ANA = '01890a5d-ac96-774b-bcce-b302099a8057';

describe('RemoveOrderItemUseCase', () => {
  it('should remove the item of a SKU', async () => {
    const orders = new InMemoryOrderRepository();
    await orders.save(
      anOrder()
        .withId(ORDER_ID)
        .withCustomerId(ANA)
        .withItems(
          { sku: 'CAN001', unitPriceInCents: 4990, quantity: 2 },
          { sku: 'CAM001', unitPriceInCents: 7990, quantity: 1 },
        )
        .build(),
    );
    const removeItem = new RemoveOrderItemUseCase(orders);

    const output = await removeItem.execute({
      orderId: ORDER_ID,
      customerId: ANA,
      sku: 'can001',
    });

    expect(output.items.map((item) => item.sku)).toEqual(['CAM001']);
    expect(output.totalInCents).toBe(7990);
  });
});
