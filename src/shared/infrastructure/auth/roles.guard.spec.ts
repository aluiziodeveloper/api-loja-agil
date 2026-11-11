import { type ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Principal } from './access-tokens.js';
import { Roles } from './roles.decorator.js';
import { RolesGuard } from './roles.guard.js';

class Routes {
  anyone(): void {}

  @Roles('OPERATOR')
  operatorsOnly(): void {}
}

const guard = new RolesGuard(new Reflector());

function contextFor(
  route: 'anyone' | 'operatorsOnly',
  principal?: Principal,
): ExecutionContext {
  return {
    getHandler: () => Routes.prototype[route],
    getClass: () => Routes,
    switchToHttp: () => ({ getRequest: () => ({ headers: {}, principal }) }),
  } as unknown as ExecutionContext;
}

const customer = { userId: 'ana', role: 'CUSTOMER' };
const operator = { userId: 'bia', role: 'OPERATOR' };

describe('RolesGuard', () => {
  it('should let any authenticated user into a route without roles', () => {
    expect(guard.canActivate(contextFor('anyone', customer))).toBe(true);
  });

  it('should let in a user with one of the roles', () => {
    expect(guard.canActivate(contextFor('operatorsOnly', operator))).toBe(true);
  });

  it('should answer 403 to a user without the role', () => {
    expect(() =>
      guard.canActivate(contextFor('operatorsOnly', customer)),
    ).toThrow(ForbiddenException);
  });

  it('should answer 403 when nobody is authenticated', () => {
    expect(() => guard.canActivate(contextFor('operatorsOnly'))).toThrow(
      ForbiddenException,
    );
  });
});
