import {
  createParamDecorator,
  type ExecutionContext,
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

/** Só existe em rota protegida: numa rota `@Public()`, pedir quem é seria um erro. */
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
