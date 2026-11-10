import type { PasswordHash } from '../../domain/password-hash.value-object.js';
import type { PasswordVerifier } from '../../domain/password-verifier.js';
import type { Password } from '../../domain/password.value-object.js';

export interface PasswordHasher extends PasswordVerifier {
  hash(password: Password): Promise<PasswordHash>;
}
