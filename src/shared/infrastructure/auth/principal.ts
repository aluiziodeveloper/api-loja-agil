import {
  createParamDecorator,
  type ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Principal } from './access-tokens.js';

/** O guard guarda aqui quem fez a requisição. */
export type AuthenticatedRequest = {
  headers: Record<string, string | string[] | undefined>;
  principal?: Principal;
};

export function requestOf(context: ExecutionContext): AuthenticatedRequest {
  return context.switchToHttp().getRequest<AuthenticatedRequest>();
}

/** Quem chamou uma rota protegida; numa rota `@Public()`, use o `OptionalPrincipal`. */
export function principalOf(
  _data: unknown,
  context: ExecutionContext,
): Principal {
  const { principal } = requestOf(context);
  if (!principal) {
    throw new UnauthorizedException('Token de acesso ausente ou inválido.');
  }
  return principal;
}

/** Quem fez a requisição, segundo o token. */
export const CurrentPrincipal = createParamDecorator(principalOf);

/** Numa rota `@Public()`: quem chamou, se mandou um token válido. */
export function optionalPrincipalOf(
  _data: unknown,
  context: ExecutionContext,
): Principal | undefined {
  return requestOf(context).principal;
}

export const OptionalPrincipal = createParamDecorator(optionalPrincipalOf);

/**
 * Para quando só uma parte da rota pública exige um perfil: responde como os
 * guards, 401 a quem não disse quem é e 403 a quem disse e não pode.
 */
export function requireRole(
  principal: Principal | undefined,
  role: string,
): void {
  if (!principal) {
    throw new UnauthorizedException('Token de acesso ausente ou inválido.');
  }
  if (principal.role !== role) {
    throw new ForbiddenException('Seu perfil não permite esta operação.');
  }
}
