import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import type { Env } from '../../../config/env.schema.js';
import { loggerOptions } from './logger-options.js';
import { ShutdownLog } from './shutdown-log.js';

/**
 * O logger do Nest vira um pino com as mesmas opções do Fastify: o mesmo
 * nível, o mesmo formato e os mesmos campos escondidos. Ele não conhece a
 * requisição, então as linhas dele saem sem `reqId`; o que precisa do
 * `reqId` escreve em `request.log`, como o filtro de erros. `useExisting`
 * deixa o log das requisições com o Fastify, sem o middleware do pino-http.
 */
@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        useExisting: true,
        pinoHttp: loggerOptions({
          NODE_ENV: config.get('NODE_ENV', { infer: true }),
          LOG_LEVEL: config.get('LOG_LEVEL', { infer: true }),
        }),
      }),
    }),
  ],
  providers: [ShutdownLog],
})
export class LoggingModule {}
