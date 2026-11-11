import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC = 'isPublic';

/** A exceção, marcada: sem ela, toda rota exige um token válido. */
export const Public = (): MethodDecorator & ClassDecorator =>
  SetMetadata(IS_PUBLIC, true);
