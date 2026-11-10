import { DomainError } from './domain-error.js';

export class InvalidIdError extends DomainError {
  readonly code = 'INVALID_ID';

  constructor(value: string) {
    super(`Identificador inválido: "${value}".`);
  }
}
