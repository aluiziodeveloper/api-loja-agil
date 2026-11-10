import { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import { InMemoryOrderRepository } from '../__tests__/in-memory-order.repository.js';
import { CreateDraftOrderUseCase } from './create-draft-order.use-case.js';

const NOW = new Date('2026-11-10T12:00:00.000Z');
const CUSTOMER_ID = '01890a5d-ac96-774b-bcce-b302099a8057';

describe('CreateDraftOrderUseCase', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should open an empty draft for the customer', async () => {
    const orders = new InMemoryOrderRepository();
    const createDraft = new CreateDraftOrderUseCase(orders);

    const output = await createDraft.execute({ customerId: CUSTOMER_ID });

    expect(output).toEqual({
      id: expect.any(String),
      customerId: CUSTOMER_ID,
      status: 'DRAFT',
      items: [],
      couponCode: null,
      subtotalInCents: 0,
      discountInCents: 0,
      totalInCents: 0,
      createdAt: '2026-11-10T12:00:00.000Z',
    });
    expect(await orders.findById(UniqueId.from(output.id))).not.toBeNull();
  });
});
