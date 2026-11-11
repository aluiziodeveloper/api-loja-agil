import { type ArgumentsHost, Logger } from '@nestjs/common';
import { ConcurrentUpdateError } from '../../application/concurrent-update.error.js';
import { ErrorResponseFilter } from './error-response.filter.js';

function httpHost() {
  const reply = { status: vi.fn(), send: vi.fn() };
  reply.status.mockReturnValue(reply);
  const host = {
    switchToHttp: () => ({ getResponse: () => reply }),
  } as unknown as ArgumentsHost;
  return { host, reply };
}

describe('ErrorResponseFilter', () => {
  const filter = new ErrorResponseFilter({ CONCURRENT_UPDATE: 409 });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should send the error under an "error" key, with its status', () => {
    const { host, reply } = httpHost();

    filter.catch(new ConcurrentUpdateError(), host);

    expect(reply.status).toHaveBeenCalledWith(409);
    expect(reply.send).toHaveBeenCalledWith({
      error: {
        code: 'CONCURRENT_UPDATE',
        message: 'O registro foi alterado por outra operação; tente de novo.',
      },
    });
  });

  it('should log what failed when the answer is a 500', () => {
    const log = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
    const { host } = httpHost();
    const failure = new TypeError('boom');

    filter.catch(failure, host);

    expect(log).toHaveBeenCalledWith('boom', failure.stack);
  });

  it('should log something thrown that is not an Error', () => {
    const log = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
    const { host } = httpHost();

    filter.catch('boom', host);

    expect(log).toHaveBeenCalledWith('boom', expect.any(String));
  });

  it('should not log what the client did wrong', () => {
    const log = vi.spyOn(Logger.prototype, 'error');
    const { host } = httpHost();

    filter.catch(new ConcurrentUpdateError(), host);

    expect(log).not.toHaveBeenCalled();
  });
});
