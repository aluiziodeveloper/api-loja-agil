import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiExtension } from '@nestjs/swagger';

export const ROLES = 'roles';

/**
 * Os perfis que podem usar a rota. Sem o decorator, basta estar autenticado.
 * O documento OpenAPI mostra os perfis e o 403 de quem não tem nenhum deles.
 */
export const Roles = (...roles: string[]): MethodDecorator & ClassDecorator =>
  applyDecorators(SetMetadata(ROLES, roles), ApiExtension('x-roles', roles));
