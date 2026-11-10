export abstract class DomainEvent {
  abstract readonly eventName: string;
  readonly occurredAt: Date;

  protected constructor(readonly aggregateId: string) {
    this.occurredAt = new Date();
  }
}
