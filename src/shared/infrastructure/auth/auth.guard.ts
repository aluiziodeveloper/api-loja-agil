import {
  type CanActivate,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import type { AccessTokens } from './access-tokens.js';
import type { Principal } from './access-tokens.js';
import { type AuthenticatedRequest, requestOf } from './principal.js';
import { IS_PUBLIC } from './public.decorator.js';

/** O esquema não diferencia maiúsculas (RFC 7235); o token é um só, sem espaços. */
const BEARER = /^Bearer (\S+)$/i;

/**
 * Guard global: toda rota exige um token de acesso válido, menos as
 * marcadas com `@Public()`. Negar por padrão é o que torna um esquecimento
 * seguro: rota nova sem decorator nasce protegida. Numa rota pública, o
 * token é opcional: se vier e for válido, a rota sabe quem chamou; se não,
 * a requisição segue anônima.
 */
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokens: AccessTokens,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = requestOf(context);
    const principal = await this.identify(request);
    if (principal) {
      request.principal = principal;
    }
    if (!principal && !this.isPublic(context)) {
      throw new UnauthorizedException('Token de acesso ausente ou inválido.');
    }
    return true;
  }

  private async identify(
    request: AuthenticatedRequest,
  ): Promise<Principal | null> {
    const token = BEARER.exec(String(request.headers.authorization))?.[1];
    return token ? this.accessTokens.verify(token) : null;
  }

  private isPublic(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
  }
}
