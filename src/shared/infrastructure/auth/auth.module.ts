import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../../config/env.schema.js';
import { AccessTokens } from './access-tokens.js';

/** Global: a Identidade emite os tokens, e o guard (aula 12-03) os confere. */
@Global()
@Module({
  providers: [
    {
      provide: AccessTokens,
      useFactory: (config: ConfigService<Env, true>) =>
        new AccessTokens({
          secret: config.get('JWT_SECRET', { infer: true }),
          expiresInSeconds: config.get('JWT_EXPIRES_IN_SECONDS', {
            infer: true,
          }),
        }),
      inject: [ConfigService],
    },
  ],
  exports: [AccessTokens],
})
export class AuthModule {}
