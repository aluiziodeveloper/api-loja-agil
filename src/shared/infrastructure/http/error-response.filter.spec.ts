import type { ArgumentsHost } from '@nestjs/common';
import { ConcurrentUpdateError } from '../../application/concurrent-update.error.js';
import { ErrorResponseFilter } from './error-response.filter.js';

function httpHost() {
  const reply = { status: vi.fn(), send: vi.fn() };
  reply.status.mockReturnValue(reply);
  const request = { log: { error: vi.fn() } };
  const host = {
    switchToHttp: () => ({
      getResponse: () => reply,
      getRequest: () => request,
    }),
  } as unknown as ArgumentsHost;
  return { host, reply, log: request.log.error };
}

describe('ErrorResponseFilter', () => {
  const filter = new ErrorResponseFilter({ CONCURRENT_UPDATE: 409 });

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

  it('should log what failed in the log of the request, when the answer is a 500', () => {
    const { host, log } = httpHost();
    const failure = new TypeError('boom');

    filter.catch(failure, host);

    expect(log).toHaveBeenCalledWith({ err: failure }, 'boom');
  });

  it('should log something thrown that is not an Error', () => {
    const { host, log } = httpHost();

    filter.catch('boom', host);

    expect(log).toHaveBeenCalledWith({ err: expect.any(Error) }, 'boom');
  });

  it('should not log what the client did wrong', () => {
    const { host, log } = httpHost();

    filter.catch(new ConcurrentUpdateError(), host);

    expect(log).not.toHaveBeenCalled();
  });
});
