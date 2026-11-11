import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { requestOf } from './principal.js';
import { ROLES } from './roles.decorator.js';

/**
 * Roda depois do `AuthGuard`: ele diz quem é; este, se o perfil pode.
 * 401 é "não sei quem você é"; 403, "sei, e você não pode".
 */
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[] | undefined>(
      ROLES,
      [context.getHandler(), context.getClass()],
    );
    const role = requestOf(context).principal?.role;
    if (roles && !roles.includes(String(role))) {
      throw new ForbiddenException('Seu perfil não permite esta operação.');
    }
    return true;
  }
}
