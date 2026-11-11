import type { DomainEvent } from '../../domain/domain-event.js';
import type { EventHandler } from './event-handler.js';
import type { EventPublisher } from './event-publisher.js';

/**
 * Entrega cada evento aos handlers inscritos no nome dele, um de cada vez e
 * na ordem: quem falha interrompe a entrega e devolve o erro (ADR 0004).
 */
export class EventDispatcher implements EventPublisher {
  private readonly handlers = new Map<string, EventHandler[]>();

  subscribe<Handled extends DomainEvent>(
    eventName: string,
    handler: EventHandler<Handled>,
  ): void {
    this.handlers.set(eventName, [...this.handlersOf(eventName), handler]);
  }

  async publish(events: DomainEvent[]): Promise<void> {
    const deliveries = events.flatMap((event) =>
      this.handlersOf(event.eventName).map(
        (handler) => () => handler.handle(event),
      ),
    );
    for (const deliver of deliveries) {
      await deliver();
    }
  }

  private handlersOf(eventName: string): EventHandler[] {
    return this.handlers.get(eventName) ?? [];
  }
}
