import { Logger } from '@nestjs/common';
import { ShutdownLog } from './shutdown-log.js';

describe('ShutdownLog', () => {
  const log = new ShutdownLog();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** As mensagens que o log recebe a partir daqui, lidas na hora do `expect`. */
  function logged(): { messages: () => string[] } {
    const spy = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    return {
      messages: () => spy.mock.calls.map(([message]) => String(message)),
    };
  }

  it('should say which signal started the shutdown', () => {
    const { messages } = logged();

    log.beforeApplicationShutdown('SIGTERM');

    expect(messages()).toEqual([
      'SIGTERM recebido: terminando as requisições em andamento.',
    ]);
  });

  it('should say when the shutdown is over', () => {
    const { messages } = logged();

    log.onApplicationShutdown('SIGTERM');

    expect(messages()).toEqual(['Encerrada (SIGTERM).']);
  });

  it('should say nothing when the application is closed by code, as in the tests', () => {
    const { messages } = logged();

    log.beforeApplicationShutdown();
    log.onApplicationShutdown();

    expect(messages()).toEqual([]);
  });
});
