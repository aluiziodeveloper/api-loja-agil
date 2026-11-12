import { type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessTokens } from './access-tokens.js';
import { AuthGuard } from './auth.guard.js';
import type { AuthenticatedRequest } from './principal.js';
import { Public } from './public.decorator.js';

class Routes {
  protected(): void {}

  @Public()
  open(): void {}
}

const tokens = new AccessTokens({
  secret: 'a-secret-with-more-than-32-characters',
  expiresInSeconds: 900,
});
const guard = new AuthGuard(new Reflector(), tokens);
const ana = {
  userId: '0b6f1c1e-3c55-4a4f-9a8e-2d8f6f7b9c10',
  role: 'CUSTOMER',
};

function contextFor(
  route: 'protected' | 'open',
  request: AuthenticatedRequest,
): ExecutionContext {
  return {
    getHandler: () => Routes.prototype[route],
    getClass: () => Routes,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  it('should let anyone into a public route', async () => {
    await expect(
      guard.canActivate(contextFor('open', { headers: {} })),
    ).resolves.toBe(true);
  });

  it('should remember who sent a valid token, even to a public route', async () => {
    const { accessToken } = await tokens.issue(ana);
    const request: AuthenticatedRequest = {
      headers: { authorization: `Bearer ${accessToken}` },
    };

    await expect(guard.canActivate(contextFor('open', request))).resolves.toBe(
      true,
    );
    expect(request.principal).toEqual(ana);
  });

  it('should let a token it cannot trust into a public route, as anonymous', async () => {
    const request: AuthenticatedRequest = {
      headers: { authorization: 'Bearer abc.def.ghi' },
    };

    await expect(guard.canActivate(contextFor('open', request))).resolves.toBe(
      true,
    );
    expect(request.principal).toBeUndefined();
  });

  it('should let in a valid Bearer token and remember who sent it', async () => {
    const { accessToken } = await tokens.issue(ana);
    const request: AuthenticatedRequest = {
      headers: { authorization: `Bearer ${accessToken}` },
    };

    await expect(
      guard.canActivate(contextFor('protected', request)),
    ).resolves.toBe(true);
    expect(request.principal).toEqual(ana);
  });

  it('should read the Bearer scheme in any case, as HTTP does', async () => {
    const { accessToken } = await tokens.issue(ana);
    const request: AuthenticatedRequest = {
      headers: { authorization: `bearer ${accessToken}` },
    };

    await expect(
      guard.canActivate(contextFor('protected', request)),
    ).resolves.toBe(true);
  });

  it.each([
    ['no token', {}],
    ['an empty Bearer', { authorization: 'Bearer ' }],
    ['two tokens', { authorization: 'Bearer abc.def.ghi jkl.mno.pqr' }],
    ['a token without the Bearer scheme', { authorization: 'abc.def.ghi' }],
    ['a token it cannot trust', { authorization: 'Bearer abc.def.ghi' }],
  ])('should answer 401 to %s', async (_, headers) => {
    await expect(
      guard.canActivate(contextFor('protected', { headers })),
    ).rejects.toThrow(UnauthorizedException);
  });
});
