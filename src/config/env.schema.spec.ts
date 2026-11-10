import { validateEnv } from './env.schema.js';

describe('validateEnv', () => {
  it('should apply default values when variables are missing', () => {
    const env = validateEnv({});

    expect(env).toEqual({ NODE_ENV: 'development', PORT: 3000 });
  });

  it('should convert PORT from string to number', () => {
    const env = validateEnv({ PORT: '8080' });

    expect(env.PORT).toBe(8080);
  });

  it.each(['abc', '0', '70000'])('should reject invalid PORT "%s"', (port) => {
    expect(() => validateEnv({ PORT: port })).toThrow(/PORT/);
  });

  it('should reject an unknown NODE_ENV', () => {
    expect(() => validateEnv({ NODE_ENV: 'staging' })).toThrow(/NODE_ENV/);
  });
});
