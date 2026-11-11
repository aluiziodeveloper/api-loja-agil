import { OPERATOR } from '../../../shared/infrastructure/auth/roles.js';
import { Role } from '../../domain/role.js';

/**
 * O Shared Kernel não importa contextos, por isso repete o valor `OPERATOR`
 * que o `@Roles()` confere. Este teste fica na borda da Identidade, que pode
 * ver os dois lados, e mantém os valores iguais sem o domínio depender da
 * infraestrutura.
 */
describe('the operator role', () => {
  it('should be the same in the domain and in the authorization', () => {
    expect(Role.OPERATOR).toBe(OPERATOR);
  });
});
