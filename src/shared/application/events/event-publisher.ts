import type { DomainEvent } from '../../domain/domain-event.js';

/** Porta: o caso de uso entrega os eventos sem saber quem os ouve. */
export abstract class EventPublisher {
  abstract publish(events: DomainEvent[]): Promise<void>;
}
