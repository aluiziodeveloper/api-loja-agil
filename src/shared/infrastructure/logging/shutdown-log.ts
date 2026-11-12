import {
  type BeforeApplicationShutdown,
  Injectable,
  Logger,
  type OnApplicationShutdown,
} from '@nestjs/common';

/**
 * Duas linhas no log de um encerramento pedido pela plataforma: quando o sinal
 * chegou e quando tudo fechou. Entre as duas, o servidor termina o que estava
 * em andamento e, depois, o banco desconecta.
 */
@Injectable()
export class ShutdownLog
  implements BeforeApplicationShutdown, OnApplicationShutdown
{
  private readonly logger = new Logger('Shutdown');

  beforeApplicationShutdown(signal?: string): void {
    if (signal) {
      this.logger.log(
        `${signal} recebido: terminando as requisições em andamento.`,
      );
    }
  }

  onApplicationShutdown(signal?: string): void {
    if (signal) {
      this.logger.log(`Encerrada (${signal}).`);
    }
  }
}
