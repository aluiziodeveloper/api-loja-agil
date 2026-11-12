import type { IncomingMessage } from 'node:http';
import { pino } from 'pino';
import type { Env } from '../../../config/env.schema.js';
import {
  isHealthProbe,
  levelOf,
  loggerOptions,
  requestIdOf,
} from './logger-options.js';

type LoggingEnv = Pick<Env, 'NODE_ENV' | 'LOG_LEVEL'>;

const production: LoggingEnv = { NODE_ENV: 'production', LOG_LEVEL: 'info' };

function requestWith(headers: Record<string, string>) {
  return { headers } as unknown as IncomingMessage;
}

describe('loggerOptions', () => {
  it('should write one JSON line per event in production, at the asked level', () => {
    const options = loggerOptions({
      NODE_ENV: 'production',
      LOG_LEVEL: 'warn',
    });

    expect(options.level).toBe('warn');
    expect(options.transport).toBeUndefined();
  });

  it('should make the lines readable in development', () => {
    const options = loggerOptions({
      NODE_ENV: 'development',
      LOG_LEVEL: 'debug',
    });

    expect(options.transport).toEqual({
      target: 'pino-pretty',
      options: { singleLine: true },
    });
  });

  it('should hide the token, the cookies and the passwords', () => {
    const lines: string[] = [];
    const logger = pino(
      { redact: loggerOptions(production).redact },
      { write: (line: string) => lines.push(line) },
    );

    logger.info({
      req: { headers: { authorization: 'Bearer eyJ...', cookie: 's=1' } },
      res: { headers: { 'set-cookie': 's=2' } },
      body: { password: 'caneca123', currentPassword: 'x', newPassword: 'y' },
    });

    expect(lines[0]).not.toMatch(/eyJ|s=1|s=2|caneca123/);
    expect(JSON.parse(lines[0] ?? '{}')).toMatchObject({
      req: { headers: { authorization: '[Redacted]', cookie: '[Redacted]' } },
      body: { password: '[Redacted]' },
    });
  });
});

describe('levelOf', () => {
  it.each([
    [500, 'error'],
    [503, 'error'],
    [404, 'warn'],
    [400, 'warn'],
    [399, 'info'],
    [200, 'info'],
  ])('should log a response %i as %s', (statusCode, level) => {
    expect(levelOf(statusCode)).toBe(level);
  });
});

describe('isHealthProbe', () => {
  it('should leave the health probes out of the log', () => {
    expect(isHealthProbe('/health')).toBe(true);
    expect(isHealthProbe('/health/ready')).toBe(true);
    expect(isHealthProbe('/orders')).toBe(false);
  });
});

describe('requestIdOf', () => {
  it('should keep the id that came from the client or the proxy', () => {
    expect(requestIdOf(requestWith({ 'x-request-id': 'abc-123' }))).toBe(
      'abc-123',
    );
  });

  it.each([['com espaço'], ['x'.repeat(65)], ['']])(
    'should create a new id instead of trusting "%s"',
    (incoming) => {
      const id = requestIdOf(requestWith({ 'x-request-id': incoming }));

      expect(id).toMatch(/^[0-9a-f-]{36}$/);
    },
  );
});
