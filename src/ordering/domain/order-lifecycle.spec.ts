import { InvalidOrderTransitionError } from './invalid-order-transition.error.js';
import { ensureTransition } from './order-lifecycle.js';
import { OrderStatus } from './order-status.js';

const { DRAFT, PLACED, PAID, SHIPPED, CANCELLED } = OrderStatus;

describe('order lifecycle', () => {
  it.each([
    [DRAFT, PLACED],
    [PLACED, PAID],
    [PAID, SHIPPED],
    [DRAFT, CANCELLED],
    [PLACED, CANCELLED],
    [PAID, CANCELLED],
  ])('should allow %s → %s (RN11)', (from, to) => {
    expect(() => ensureTransition(from, to)).not.toThrow();
  });

  it.each([
    [DRAFT, PAID],
    [DRAFT, SHIPPED],
    [PLACED, DRAFT],
    [PLACED, SHIPPED],
    [PAID, PLACED],
    [SHIPPED, CANCELLED],
    [CANCELLED, PLACED],
    [PLACED, PLACED],
  ])('should refuse %s → %s (RN11)', (from, to) => {
    expect(() => ensureTransition(from, to)).toThrow(
      InvalidOrderTransitionError,
    );
  });

  it('should explain the refused transition', () => {
    expect(() => ensureTransition(SHIPPED, CANCELLED)).toThrow(
      expect.objectContaining({
        code: 'INVALID_ORDER_TRANSITION',
        message: 'Um pedido SHIPPED não pode passar para CANCELLED.',
      }),
    );
  });
});
