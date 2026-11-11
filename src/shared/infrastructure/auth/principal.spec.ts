import { type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { type AuthenticatedRequest, principalOf } from './principal.js';

function contextWith(request: AuthenticatedRequest): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('principalOf', () => {
  it('should give the principal the guard remembered', () => {
    const principal = { userId: 'ana', role: 'CUSTOMER' };

    expect(
      principalOf(undefined, contextWith({ headers: {}, principal })),
    ).toBe(principal);
  });

  it('should answer 401 when there is nobody', () => {
    expect(() => principalOf(undefined, contextWith({ headers: {} }))).toThrow(
      UnauthorizedException,
    );
  });
});
