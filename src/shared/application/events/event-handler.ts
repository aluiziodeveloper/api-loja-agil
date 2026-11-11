import type { DomainEvent } from '../../domain/domain-event.js';

/** Reage a um evento. Um erro aqui interrompe a operação que o publicou. */
export interface EventHandler<Handled extends DomainEvent = DomainEvent> {
  handle(event: Handled): Promise<void>;
}
