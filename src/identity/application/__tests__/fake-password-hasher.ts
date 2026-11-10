import { PasswordHash } from '../../domain/password-hash.value-object.js';
import type { Password } from '../../domain/password.value-object.js';
import type { PasswordHasher } from '../ports/password-hasher.js';

/** Hash previsível para testes: "hashed:" + senha. Nunca use em produção. */
export class FakePasswordHasher implements PasswordHasher {
  async hash(password: Password): Promise<PasswordHash> {
    return PasswordHash.fromHash(`hashed:${password.reveal()}`);
  }

  async verify(password: Password, hash: PasswordHash): Promise<boolean> {
    return hash.toString() === `hashed:${password.reveal()}`;
  }
}
