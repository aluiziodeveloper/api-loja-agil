import { DomainError } from '../../../shared/domain/domain-error.js';

export class IncorrectCurrentPasswordError extends DomainError {
  readonly code = 'INCORRECT_CURRENT_PASSWORD';

  constructor() {
    super('A senha atual está incorreta.');
  }
}
