import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiExtension } from '@nestjs/swagger';

export const IS_PUBLIC = 'isPublic';

/**
 * A exceção, marcada: sem ela, toda rota exige um token válido. A mesma
 * marca abre a rota no guard e no documento OpenAPI.
 */
export const Public = (): MethodDecorator & ClassDecorator =>
  applyDecorators(SetMetadata(IS_PUBLIC, true), ApiExtension('x-public', true));
