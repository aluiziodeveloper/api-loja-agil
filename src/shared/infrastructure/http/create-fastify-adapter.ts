import { FastifyAdapter } from '@nestjs/platform-fastify';
import {
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
  LogController,
} from 'fastify';
import { pino, type DestinationStream } from 'pino';
import {
  isHealthProbe,
  levelOf,
  loggerOptions,
  type LoggingEnv,
  REQUEST_ID_HEADER,
  requestIdOf,
} from '../logging/logger-options.js';

/** O resumo de uma requisição respondida: o que foi pedido e o que saiu. */
function summaryOf(request: FastifyRequest, reply: FastifyReply) {
  return {
    req: { method: request.method, url: request.url },
    res: { statusCode: reply.statusCode },
    responseTime: Math.round(reply.elapsedTime),
  };
}

/**
 * As linhas que o próprio Fastify escreve por requisição: uma só, no fim, no
 * nível do status, e nenhuma para as sondas de saúde.
 */
class RequestLogController extends LogController {
  override isLogDisabled(request: FastifyRequest): boolean {
    return isHealthProbe(request.url);
  }

  override incomingRequest(): void {}

  override requestCompleted(
    _error: Error | null,
    request: FastifyRequest,
    reply: FastifyReply,
  ): void {
    if (!this.isLogDisabled(request)) {
      const level = levelOf(reply.statusCode);
      request.log[level](summaryOf(request, reply), 'request completed');
    }
  }
}

/** O id volta no header da resposta. */
async function echoRequestId(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  void reply.header(REQUEST_ID_HEADER, request.id);
}

/**
 * No encerramento, o servidor espera as requisições em andamento. Mas uma
 * conexão keep-alive que fica ociosa depois de responder segura o
 * encerramento até o timeout dela (72 s no Fastify). Com `Connection: close`
 * nas respostas que ainda saem, o cliente solta a conexão na hora.
 */
function releaseConnectionsWhenClosing(fastify: FastifyInstance): void {
  let closing = false;
  fastify.addHook('preClose', async () => {
    closing = true;
  });
  fastify.addHook('onSend', async (_request, reply) => {
    if (closing) {
      void reply.header('connection', 'close');
    }
  });
}

/**
 * O Fastify já usa o pino e dá um id a cada requisição; as linhas daquela
 * requisição levam esse id (`reqId`). A resposta devolve o mesmo id, para o
 * cliente citar num chamado e alguém achar as linhas dela.
 */
export function createFastifyAdapter(
  env: LoggingEnv,
  destination?: DestinationStream,
): FastifyAdapter {
  const adapter = new FastifyAdapter({
    loggerInstance: pino(loggerOptions(env), destination),
    genReqId: requestIdOf,
    logController: new RequestLogController(),
  });
  adapter.getInstance().addHook('onRequest', echoRequestId);
  releaseConnectionsWhenClosing(adapter.getInstance());
  return adapter;
}
