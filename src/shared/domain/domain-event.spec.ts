import { DomainEvent } from './domain-event.js';

class SampleHappened extends DomainEvent {
  readonly eventName = 'SampleHappened';

  constructor(aggregateId: string) {
    super(aggregateId);
  }
}

describe('DomainEvent', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should keep the id of the aggregate that produced it', () => {
    const event = new SampleHappened('aggregate-1');

    expect(event.aggregateId).toBe('aggregate-1');
    expect(event.eventName).toBe('SampleHappened');
  });

  it('should record when it occurred', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-10T12:00:00.000Z'));

    const event = new SampleHappened('aggregate-1');

    expect(event.occurredAt).toEqual(new Date('2026-11-10T12:00:00.000Z'));
  });
});
