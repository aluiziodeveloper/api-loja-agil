import {
  type ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  type AuthenticatedRequest,
  optionalPrincipalOf,
  principalOf,
  requireRole,
} from './principal.js';

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

describe('optionalPrincipalOf', () => {
  it('should give the principal when there is one, and nothing otherwise', () => {
    const principal = { userId: 'ana', role: 'CUSTOMER' };

    expect(
      optionalPrincipalOf(undefined, contextWith({ headers: {}, principal })),
    ).toBe(principal);
    expect(
      optionalPrincipalOf(undefined, contextWith({ headers: {} })),
    ).toBeUndefined();
  });
});

describe('requireRole', () => {
  it('should let the role through', () => {
    expect(() =>
      requireRole({ userId: 'olga', role: 'OPERATOR' }, 'OPERATOR'),
    ).not.toThrow();
  });

  it('should answer 401 to nobody and 403 to another role', () => {
    expect(() => requireRole(undefined, 'OPERATOR')).toThrow(
      UnauthorizedException,
    );
    expect(() =>
      requireRole({ userId: 'ana', role: 'CUSTOMER' }, 'OPERATOR'),
    ).toThrow(ForbiddenException);
  });
});
