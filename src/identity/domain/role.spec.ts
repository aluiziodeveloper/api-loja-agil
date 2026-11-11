import { OPERATOR } from '../../shared/infrastructure/auth/roles.js';
import { InvalidRoleError } from './invalid-role.error.js';
import { Role, parseRole } from './role.js';

describe('Role', () => {
  it('should define the CUSTOMER and OPERATOR roles', () => {
    expect(Object.values(Role)).toEqual(['CUSTOMER', 'OPERATOR']);
  });

  it('should be the operator role the authorization checks', () => {
    expect(Role.OPERATOR).toBe(OPERATOR);
  });

  it.each(['CUSTOMER', 'OPERATOR'])('should parse the role %s', (value) => {
    expect(parseRole(value)).toBe(value);
  });

  it.each(['ADMIN', 'customer', ''])(
    'should reject the unknown role "%s"',
    (value) => {
      expect(() => parseRole(value)).toThrow(InvalidRoleError);
    },
  );

  it('should report the INVALID_ROLE code', () => {
    expect(() => parseRole('ADMIN')).toThrow(
      expect.objectContaining({
        code: 'INVALID_ROLE',
        message: 'Perfil inválido: "ADMIN".',
      }),
    );
  });
});
