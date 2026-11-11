import type { PasswordHash } from '../../domain/password-hash.value-object.js';
import type { PasswordVerifier } from '../../domain/password-verifier.js';
import type { Password } from '../../domain/password.value-object.js';

export abstract class PasswordHasher implements PasswordVerifier {
  abstract hash(password: Password): Promise<PasswordHash>;
  abstract verify(password: Password, hash: PasswordHash): Promise<boolean>;
}
