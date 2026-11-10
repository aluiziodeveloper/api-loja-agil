import { DomainError } from '../../shared/domain/domain-error.js';

export class MissingAdjustmentReasonError extends DomainError {
  readonly code = 'MISSING_ADJUSTMENT_REASON';

  constructor() {
    super('Informe o motivo do ajuste de estoque.');
  }
}
