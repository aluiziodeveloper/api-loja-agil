import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import type { Env } from '../../../config/env.schema.js';
import { loggerOptions } from './logger-options.js';
import { ShutdownLog } from './shutdown-log.js';

/**
 * O logger do Nest vira o pino. Dentro de uma requisição, ele usa o logger
 * dela, o do Fastify, com o `reqId` (`useExisting`). Fora de uma requisição,
 * na inicialização por exemplo, usa um pino com as mesmas opções: o mesmo
 * nível, o mesmo formato e os mesmos campos escondidos.
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
