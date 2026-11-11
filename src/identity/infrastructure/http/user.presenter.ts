import { z } from 'zod';
import type { UserOutput } from '../../application/user-output.js';
import { Role } from '../../domain/role.js';

/** O contrato da API para um usuário: só estes campos saem, nunca outros. */
export const userResponse = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.string(),
  role: z.enum(Role),
});

export type UserResponse = z.infer<typeof userResponse>;

export function presentUser(user: UserOutput): UserResponse {
  return userResponse.parse(user);
}
