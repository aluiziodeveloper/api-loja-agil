import { DomainError } from '../../domain/domain-error.js';

export class InvalidSearchParamsError extends DomainError {
  readonly code = 'INVALID_SEARCH_PARAMS';

  constructor(detail: string) {
    super(`Parâmetros de busca inválidos: ${detail}`);
  }
}
