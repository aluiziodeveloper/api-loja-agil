import { DomainEvent } from '../../shared/domain/domain-event.js';

export class UserRegistered extends DomainEvent {
  readonly eventName = 'UserRegistered';

  constructor(
    aggregateId: string,
    readonly email: string,
  ) {
    super(aggregateId);
  }
}
