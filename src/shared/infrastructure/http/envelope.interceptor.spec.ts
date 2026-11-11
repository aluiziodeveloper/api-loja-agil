import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import { EnvelopeInterceptor } from './envelope.interceptor.js';

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

  it('should leave an empty answer empty', async () => {
    await expect(respond(undefined)).resolves.toBeUndefined();
  });
});
