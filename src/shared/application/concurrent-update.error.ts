import { DomainError } from '../domain/domain-error.js';

/** Outra operação gravou o mesmo registro depois que este foi carregado. */
export class ConcurrentUpdateError extends DomainError {
  readonly code = 'CONCURRENT_UPDATE';

  constructor() {
    super('O registro foi alterado por outra operação; tente de novo.');
  }
}
