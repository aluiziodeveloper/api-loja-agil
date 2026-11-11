import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import { EnvelopeInterceptor } from './envelope.interceptor.js';
import { Page } from './page.js';

function respond(value: unknown): Promise<unknown> {
  const handler: CallHandler = { handle: () => of(value) };
  const response = new EnvelopeInterceptor().intercept(
    {} as ExecutionContext,
    handler,
  );
  return lastValueFrom(response);
}

describe('EnvelopeInterceptor', () => {
  it('should put what the controller returned under "data"', async () => {
    await expect(respond({ id: '1' })).resolves.toEqual({ data: { id: '1' } });
  });

  it('should put a list under "data" too', async () => {
    await expect(respond([{ id: '1' }])).resolves.toEqual({
      data: [{ id: '1' }],
    });
  });

  it('should put the items of a page under "data" and the rest under "meta"', async () => {
    const meta = { total: 1, page: 1, perPage: 15, lastPage: 1 };

    await expect(respond(new Page([{ id: '1' }], meta))).resolves.toEqual({
      data: [{ id: '1' }],
      meta,
    });
  });

  it('should leave an empty answer empty', async () => {
    await expect(respond(undefined)).resolves.toBeUndefined();
  });
});
