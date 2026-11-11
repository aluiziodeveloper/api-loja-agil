import { DomainEvent } from '../../domain/domain-event.js';
import type { EventHandler } from './event-handler.js';
import { EventDispatcher } from './event-dispatcher.js';

class TestEvent extends DomainEvent {
  constructor(
    readonly eventName: string,
    aggregateId: string,
  ) {
    super(aggregateId);
  }
}

/** Um handler que anota no log o que recebeu. */
function recorder(log: string[], label: string): EventHandler {
  return {
    handle: async (event) => {
      log.push(`${label}:${event.eventName}:${event.aggregateId}`);
    },
  };
}

describe('EventDispatcher', () => {
  let dispatcher: EventDispatcher;
  let log: string[];

  beforeEach(() => {
    dispatcher = new EventDispatcher();
    log = [];
  });

  it('should deliver an event to every handler subscribed to its name', async () => {
    dispatcher.subscribe('OrderPlaced', recorder(log, 'stock'));
    dispatcher.subscribe('OrderPlaced', recorder(log, 'email'));
    dispatcher.subscribe('OrderPaid', recorder(log, 'invoice'));

    await dispatcher.publish([new TestEvent('OrderPlaced', 'order-1')]);

    expect(log).toEqual([
      'stock:OrderPlaced:order-1',
      'email:OrderPlaced:order-1',
    ]);
  });

  it('should deliver the events in the order they were published', async () => {
    dispatcher.subscribe('OrderPlaced', recorder(log, 'stock'));
    dispatcher.subscribe('OrderPaid', recorder(log, 'stock'));

    await dispatcher.publish([
      new TestEvent('OrderPlaced', 'order-1'),
      new TestEvent('OrderPaid', 'order-1'),
    ]);

    expect(log).toEqual([
      'stock:OrderPlaced:order-1',
      'stock:OrderPaid:order-1',
    ]);
  });

  it('should ignore an event nobody listens to', async () => {
    await expect(
      dispatcher.publish([new TestEvent('OrderShipped', 'order-1')]),
    ).resolves.toBeUndefined();
  });

  it('should stop at the first handler that fails', async () => {
    const failure = new Error('sem estoque');
    dispatcher.subscribe('OrderPlaced', {
      handle: async () => Promise.reject(failure),
    });
    dispatcher.subscribe('OrderPlaced', recorder(log, 'email'));

    await expect(
      dispatcher.publish([new TestEvent('OrderPlaced', 'order-1')]),
    ).rejects.toBe(failure);
    expect(log).toEqual([]);
  });
});
