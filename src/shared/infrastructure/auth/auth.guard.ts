import {
  type CanActivate,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import type { AccessTokens } from './access-tokens.js';
import { requestOf } from './principal.js';
import { IS_PUBLIC } from './public.decorator.js';

/** O esquema não diferencia maiúsculas (RFC 7235); o token é um só, sem espaços. */
const BEARER = /^Bearer (\S+)$/i;

/**
 * Guard global: toda rota exige um token de acesso válido, menos as
 * marcadas com `@Public()`. Negar por padrão é o que torna um esquecimento
 * seguro: rota nova sem decorator nasce protegida.
 */
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokens: AccessTokens,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isPublic(context)) {
      return true;
    }
    const request = requestOf(context);
    const token = BEARER.exec(String(request.headers.authorization))?.[1];
    const principal = token ? await this.accessTokens.verify(token) : null;
    if (!principal) {
      throw new UnauthorizedException('Token de acesso ausente ou inválido.');
    }
    request.principal = principal;
    return true;
  }

  private isPublic(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
  }
}
