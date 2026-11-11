import { InMemoryTransaction } from '../../../shared/application/__tests__/in-memory-transaction.js';
import { EventDispatcher } from '../../../shared/application/events/event-dispatcher.js';
import { EventPublisher } from '../../../shared/application/events/event-publisher.js';
import { Transaction } from '../../../shared/application/transaction.js';
import { InMemoryOrderRepository } from '../../application/__tests__/in-memory-order.repository.js';
import { OrderRepository } from '../../application/ports/order.repository.js';
import type { OrderLifecycleDeps } from '../../application/transition-order.js';
import { provideTransition } from './provide-transition.js';

class SomeTransition {
  constructor(readonly deps: OrderLifecycleDeps) {}
}

describe('provideTransition', () => {
  const provider = provideTransition(SomeTransition);

  it('should ask Nest for the repository, the publisher and the transaction', () => {
    expect(provider.provide).toBe(SomeTransition);
    expect(provider.inject).toEqual([
      OrderRepository,
      EventPublisher,
      Transaction,
    ]);
  });

  it('should hand the three to the use case in one object', () => {
    const orders = new InMemoryOrderRepository();
    const events = new EventDispatcher();
    const transaction = new InMemoryTransaction([orders]);

    const useCase = provider.useFactory(orders, events, transaction);

    expect(useCase.deps).toEqual({ orders, events, transaction });
  });
});
