import { randomUUID } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import type { LevelWithSilent, LoggerOptions } from 'pino';
import type { Env } from '../../../config/env.schema.js';

export type LoggingEnv = Pick<Env, 'NODE_ENV' | 'LOG_LEVEL'>;

export const REQUEST_ID_HEADER = 'x-request-id';

/** Um id que veio de fora só é aceito se for curto e sem nada estranho. */
const SAFE_REQUEST_ID = /^[\w-]{1,64}$/;

/**
 * O id que amarra todas as linhas de uma requisição. Vem do proxy, quando ele
 * manda um que dá para confiar; senão, nasce aqui.
 */
export function requestIdOf(request: IncomingMessage): string {
  const incoming = request.headers[REQUEST_ID_HEADER];
  return typeof incoming === 'string' && SAFE_REQUEST_ID.test(incoming)
    ? incoming
    : randomUUID();
}

/** Falha nossa é erro; falha do cliente é aviso; o resto, informação. */
export function levelOf(statusCode: number): LevelWithSilent {
  if (statusCode >= 500) {
    return 'error';
  }
  return statusCode >= 400 ? 'warn' : 'info';
}

/** A plataforma pergunta a cada poucos segundos: não é tráfego de cliente. */
export function isHealthProbe(url: string): boolean {
  return url.startsWith('/health');
}

/** O que nunca pode ir para um log: quem lê o log não deveria virar o usuário. */
const REDACTED_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
  '*.password',
  '*.currentPassword',
  '*.newPassword',
];

/** Em desenvolvimento, uma linha legível; em produção, JSON para a plataforma. */
const PRETTY = {
  transport: { target: 'pino-pretty', options: { singleLine: true } },
};

/** O pino do Fastify: o nível do ambiente, sem segredos, legível só no dev. */
export function loggerOptions({
  NODE_ENV,
  LOG_LEVEL,
}: LoggingEnv): LoggerOptions {
  return {
    level: LOG_LEVEL,
    redact: REDACTED_PATHS,
    ...(NODE_ENV === 'development' ? PRETTY : {}),
  };
}
