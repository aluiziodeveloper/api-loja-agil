import type { UserOutput } from '../../application/user-output.js';
import { presentUser } from './user.presenter.js';

describe('presentUser', () => {
  const output: UserOutput = {
    id: '0b6f1c1e-3c55-4a4f-9a8e-2d8f6f7b9c10',
    name: 'Ana Souza',
    email: 'ana@loja.dev',
    role: 'CUSTOMER',
  };

  it('should answer with the fields of the API contract', () => {
    expect(presentUser(output)).toEqual(output);
  });

  it('should leave out any field the contract does not have', () => {
    const leaky = { ...output, passwordHash: 'scrypt$...' };

    expect(presentUser(leaky)).not.toHaveProperty('passwordHash');
  });
});
