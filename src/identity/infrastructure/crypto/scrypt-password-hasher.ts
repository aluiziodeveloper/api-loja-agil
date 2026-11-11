import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { PasswordHasher } from '../../application/ports/password-hasher.js';
import { PasswordHash } from '../../domain/password-hash.value-object.js';
import type { Password } from '../../domain/password.value-object.js';

const ALGORITHM = 'scrypt';
const SALT_BYTES = 16;
const KEY_BYTES = 64;

const deriveKey = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keyLength: number,
) => Promise<Buffer>;

type StoredHash = { salt: Buffer; key: Buffer };

/** `scrypt$<salt>$<chave>`, em base64: o algoritmo e o salt viajam com o hash. */
function parse(hash: PasswordHash): StoredHash | null {
  const [algorithm, salt, key] = hash.toString().split('$');
  if (algorithm !== ALGORITHM || !salt || !key) {
    return null;
  }
  return { salt: Buffer.from(salt, 'base64'), key: Buffer.from(key, 'base64') };
}

/** O adaptador da porta `PasswordHasher` com o `scrypt` do Node (ADR 0006). */
export class ScryptPasswordHasher implements PasswordHasher {
  async hash(password: Password): Promise<PasswordHash> {
    const salt = randomBytes(SALT_BYTES);
    const key = await deriveKey(password.reveal(), salt, KEY_BYTES);
    return PasswordHash.fromHash(
      [ALGORITHM, salt.toString('base64'), key.toString('base64')].join('$'),
    );
  }

  /** Compara em tempo constante: quanto demora não revela onde as chaves diferem. */
  async verify(password: Password, hash: PasswordHash): Promise<boolean> {
    const stored = parse(hash);
    if (!stored || stored.key.length !== KEY_BYTES) {
      return false;
    }
    const key = await deriveKey(password.reveal(), stored.salt, KEY_BYTES);
    return timingSafeEqual(key, stored.key);
  }
}
