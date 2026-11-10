import { DomainError } from './domain-error.js';

export class InvalidMoneyError extends DomainError {
  readonly code = 'INVALID_MONEY';

  constructor(cents: number) {
    super(
      `Valor monetário inválido: ${cents}. Use centavos inteiros e não negativos.`,
    );
  }
}
