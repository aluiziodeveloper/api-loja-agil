import { InvalidRoleError } from './invalid-role.error.js';

export const Role = {
  CUSTOMER: 'CUSTOMER',
  OPERATOR: 'OPERATOR',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

const ROLES: readonly string[] = Object.values(Role);

function isRole(value: string): value is Role {
  return ROLES.includes(value);
}

export function parseRole(value: string): Role {
  if (!isRole(value)) {
    throw new InvalidRoleError(value);
  }
  return value;
}
