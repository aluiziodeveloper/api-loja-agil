import { DomainError } from '../../shared/domain/domain-error.js';

export class InvalidEmailError extends DomainError {
  readonly code = 'INVALID_EMAIL';

  constructor(value: string) {
    super(`E-mail inválido: "${value}".`);
  }
}
