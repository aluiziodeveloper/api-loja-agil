import { DomainError } from '../../shared/domain/domain-error.js';

export class WeakPasswordError extends DomainError {
  readonly code = 'WEAK_PASSWORD';

  constructor(minLength: number, maxLength: number) {
    super(
      `A senha deve ter entre ${minLength} e ${maxLength} caracteres, com letras e números.`,
    );
  }
}
