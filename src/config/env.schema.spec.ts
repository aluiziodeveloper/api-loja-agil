import { validateEnv } from './env.schema.js';

const DATABASE_URL = 'postgresql://postgres:docker@db:5432/loja_agil';

describe('validateEnv', () => {
  it('should apply default values when variables are missing', () => {
    const env = validateEnv({ DATABASE_URL });

    expect(env).toEqual({ NODE_ENV: 'development', PORT: 3000, DATABASE_URL });
  });

  it('should convert PORT from string to number', () => {
    const env = validateEnv({ DATABASE_URL, PORT: '8080' });

    expect(env.PORT).toBe(8080);
  });

  it.each(['abc', '0', '70000'])('should reject invalid PORT "%s"', (port) => {
    expect(() => validateEnv({ DATABASE_URL, PORT: port })).toThrow(/PORT/);
  });

  it('should reject an unknown NODE_ENV', () => {
    expect(() => validateEnv({ DATABASE_URL, NODE_ENV: 'staging' })).toThrow(
      /NODE_ENV/,
    );
  });

  it.each([undefined, 'not-a-url'])(
    'should reject a missing or malformed DATABASE_URL (%s)',
    (url) => {
      expect(() => validateEnv({ DATABASE_URL: url })).toThrow(/DATABASE_URL/);
    },
  );
});
