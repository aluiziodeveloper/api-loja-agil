import { DomainError } from '../../shared/domain/domain-error.js';

export class InvalidRoleError extends DomainError {
  readonly code = 'INVALID_ROLE';

  constructor(value: string) {
    super(`Perfil inválido: "${value}".`);
  }
}
