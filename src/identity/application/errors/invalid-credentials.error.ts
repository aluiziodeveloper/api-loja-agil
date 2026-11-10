import { DomainError } from '../../../shared/domain/domain-error.js';

export class InvalidCredentialsError extends DomainError {
  readonly code = 'INVALID_CREDENTIALS';

  constructor() {
    super('E-mail ou senha inválidos.');
  }
}
