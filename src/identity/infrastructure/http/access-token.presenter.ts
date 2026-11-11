import { z } from 'zod';
import type { IssuedToken } from '../../../shared/infrastructure/auth/access-tokens.js';

/** O cliente manda `accessToken` de volta no header `Authorization: Bearer`. */
export const accessTokenResponse = z.object({
  accessToken: z.string(),
  tokenType: z.literal('Bearer'),
  expiresInSeconds: z.number().int(),
});

export type AccessTokenResponse = z.infer<typeof accessTokenResponse>;

export function presentAccessToken(token: IssuedToken): AccessTokenResponse {
  return accessTokenResponse.parse(token);
}
