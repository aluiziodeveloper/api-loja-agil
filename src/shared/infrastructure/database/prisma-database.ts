import { AsyncLocalStorage } from 'node:async_hooks';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type Prisma } from '../../../generated/prisma/client.js';
import type { Transaction } from '../../application/transaction.js';

/** O client de quem pede: o da transação em curso, ou o principal. */
export type DatabaseClient = PrismaClient | Prisma.TransactionClient;

/**
 * O acesso ao banco e a porta `Transaction`. Dentro de `run`, o client da
 * transação fica guardado no `AsyncLocalStorage` daquela chamada: os
 * repositórios pedem `client()` e participam dela sem saber que ela existe.
 */
export class PrismaDatabase implements Transaction {
  private readonly prisma: PrismaClient;
  private readonly current = new AsyncLocalStorage<Prisma.TransactionClient>();

  constructor(connectionString: string) {
    this.prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    });
  }

  client(): DatabaseClient {
    return this.current.getStore() ?? this.prisma;
  }

  /** Já dentro de uma transação? O trabalho entra nela, em vez de abrir outra. */
  async run<Result>(work: () => Promise<Result>): Promise<Result> {
    if (this.current.getStore()) {
      return work();
    }
    return this.prisma.$transaction((transaction) =>
      this.current.run(transaction, work),
    );
  }

  /** Uma consulta trivial: falha se o banco não responde. */
  async ping(): Promise<void> {
    await this.prisma.$queryRaw`SELECT 1`;
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
