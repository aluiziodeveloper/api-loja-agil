import { AdjustmentReason } from './adjustment-reason.value-object.js';

describe('AdjustmentReason', () => {
  it('should keep the reason without surrounding spaces', () => {
    expect(AdjustmentReason.create('  Contagem mensal ').toString()).toBe(
      'Contagem mensal',
    );
  });

  it.each(['', '   '])('should require a reason (%#)', (reason) => {
    expect(() => AdjustmentReason.create(reason)).toThrow(
      expect.objectContaining({
        code: 'MISSING_ADJUSTMENT_REASON',
        message: 'Informe o motivo do ajuste de estoque.',
      }),
    );
  });
});
