import { DomainError } from '../../shared/domain/domain-error.js';

export class InvalidPasswordHashError extends DomainError {
  readonly code = 'INVALID_PASSWORD_HASH';

  constructor() {
    super('Hash de senha inválido: o valor não pode ser vazio.');
  }
}
