import type { FactoryProvider } from '@nestjs/common';
import { EventPublisher } from '../../../shared/application/events/event-publisher.js';
import { Transaction } from '../../../shared/application/transaction.js';
import { OrderRepository } from '../../application/ports/order.repository.js';
import type { OrderLifecycleDeps } from '../../application/transition-order.js';

type TransitionUseCase<Instance> = new (deps: OrderLifecycleDeps) => Instance;

type TransitionProvider<Instance> = Omit<
  FactoryProvider<Instance>,
  'useFactory'
> & {
  useFactory: (
    ...deps: [OrderRepository, EventPublisher, Transaction]
  ) => Instance;
};

/** As transições do pedido recebem as três dependências num objeto só (aula 09-03). */
export function provideTransition<Instance>(
  useCase: TransitionUseCase<Instance>,
): TransitionProvider<Instance> {
  return {
    provide: useCase,
    useFactory: (orders, events, transaction) =>
      new useCase({ orders, events, transaction }),
    inject: [OrderRepository, EventPublisher, Transaction],
  };
}
