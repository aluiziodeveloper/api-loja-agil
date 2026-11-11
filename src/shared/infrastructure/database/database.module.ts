import {
  Global,
  Inject,
  Module,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../../config/env.schema.js';
import { Transaction } from '../../application/transaction.js';
import { PrismaDatabase } from './prisma-database.js';

/**
 * Um único `PrismaDatabase` para a aplicação inteira: os repositórios de todos
 * os contextos e a porta `Transaction` usam a mesma conexão, e por isso a
 * mesma transação. Global porque todo contexto com persistência precisa dele.
 */
@Global()
@Module({
  providers: [
    {
      provide: PrismaDatabase,
      useFactory: (config: ConfigService<Env, true>) =>
        new PrismaDatabase(config.get('DATABASE_URL', { infer: true })),
      inject: [ConfigService],
    },
    // A mesma instância atende à porta: quem pede `Transaction` recebe o banco.
    { provide: Transaction, useExisting: PrismaDatabase },
  ],
  exports: [PrismaDatabase, Transaction],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(
    @Inject(PrismaDatabase) private readonly database: PrismaDatabase,
  ) {}

  async onApplicationShutdown(): Promise<void> {
    await this.database.disconnect();
  }
}
