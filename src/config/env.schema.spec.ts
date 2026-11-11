import { validateEnv } from './env.schema.js';

const DATABASE_URL = 'postgresql://postgres:docker@db:5432/loja_agil';
const JWT_SECRET = 'a-secret-with-more-than-32-characters';
const required = { DATABASE_URL, JWT_SECRET };

describe('validateEnv', () => {
  it('should apply default values when variables are missing', () => {
    const env = validateEnv(required);

    expect(env).toEqual({
      NODE_ENV: 'development',
      PORT: 3000,
      ...required,
      JWT_EXPIRES_IN_SECONDS: 3600,
    });
  });

  it('should convert PORT from string to number', () => {
    const env = validateEnv({ ...required, PORT: '8080' });

    expect(env.PORT).toBe(8080);
  });

  it.each(['abc', '0', '70000'])('should reject invalid PORT "%s"', (port) => {
    expect(() => validateEnv({ ...required, PORT: port })).toThrow(/PORT/);
  });

  it('should reject an unknown NODE_ENV', () => {
    expect(() => validateEnv({ ...required, NODE_ENV: 'staging' })).toThrow(
      /NODE_ENV/,
    );
  });

  it.each([undefined, 'not-a-url'])(
    'should reject a missing or malformed DATABASE_URL (%s)',
    (url) => {
      expect(() => validateEnv({ ...required, DATABASE_URL: url })).toThrow(
        /DATABASE_URL/,
      );
    },
  );

  it.each([undefined, 'short-secret'])(
    'should reject a missing or short JWT_SECRET (%s)',
    (secret) => {
      expect(() => validateEnv({ ...required, JWT_SECRET: secret })).toThrow(
        /JWT_SECRET/,
      );
    },
  );

  it('should convert the token lifetime from string to number', () => {
    const env = validateEnv({ ...required, JWT_EXPIRES_IN_SECONDS: '900' });

    expect(env.JWT_EXPIRES_IN_SECONDS).toBe(900);
  });
});
