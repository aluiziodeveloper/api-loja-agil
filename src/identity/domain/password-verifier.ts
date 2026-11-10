import type { PasswordHash } from './password-hash.value-object.js';
import type { Password } from './password.value-object.js';

export interface PasswordVerifier {
  verify(password: Password, hash: PasswordHash): Promise<boolean>;
}
