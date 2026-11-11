import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import {
  AccessTokens,
  type Principal,
} from '../../src/shared/infrastructure/auth/access-tokens.js';

export const OPERATOR: Principal = {
  userId: '9d1e2f3a-4b5c-4d6e-8f70-81a2b3c4d5e6',
  role: 'OPERATOR',
};

export function customer(userId: string): Principal {
  return { userId, role: 'CUSTOMER' };
}

/** O header de quem faz a requisição, com um token emitido pela própria aplicação. */
export async function authAs(
  app: NestFastifyApplication,
  principal: Principal,
): Promise<{ authorization: string }> {
  const { accessToken } = await app.get(AccessTokens).issue(principal);
  return { authorization: `Bearer ${accessToken}` };
}
