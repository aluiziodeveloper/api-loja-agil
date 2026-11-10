import { ValueObject } from '../../shared/domain/value-object.js';
import { MissingAdjustmentReasonError } from './missing-adjustment-reason.error.js';

/** Todo ajuste de inventário precisa de uma justificativa para a auditoria. */
export class AdjustmentReason extends ValueObject<{ value: string }> {
  static create(value: string): AdjustmentReason {
    const trimmed = value.trim();
    if (!trimmed) {
      throw new MissingAdjustmentReasonError();
    }
    return new AdjustmentReason({ value: trimmed });
  }

  toString(): string {
    return this.props.value;
  }
}
