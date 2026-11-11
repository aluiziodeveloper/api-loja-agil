import { SetMetadata } from '@nestjs/common';

export const ROLES = 'roles';

/** Os perfis que podem usar a rota. Sem o decorator, basta estar autenticado. */
export const Roles = (...roles: string[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES, roles);
