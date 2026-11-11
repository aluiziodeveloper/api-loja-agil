import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../generated/prisma/client.js';

/** O acesso ao banco: os repositórios pedem o client aqui, e nunca o criam. */
export class PrismaDatabase {
  private readonly prisma: PrismaClient;

  constructor(connectionString: string) {
    this.prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    });
  }

  client(): PrismaClient {
    return this.prisma;
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
