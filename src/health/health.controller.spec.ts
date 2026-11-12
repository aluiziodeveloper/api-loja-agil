import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  const reachable = { ping: async () => undefined };

  it('should report the application as alive', () => {
    const controller = new HealthController(reachable);

    const result = controller.check();

    expect(result.status).toBe('ok');
    expect(result.uptimeInSeconds).toBeGreaterThanOrEqual(0);
  });

  it('should be ready when the database answers', async () => {
    const controller = new HealthController(reachable);

    await expect(controller.ready()).resolves.toEqual({
      status: 'ready',
      checks: { database: 'up' },
    });
  });

  it('should refuse traffic while the database does not answer', async () => {
    const controller = new HealthController({
      ping: () => Promise.reject(new Error('connect ECONNREFUSED')),
    });

    const failure = controller.ready();

    await expect(failure).rejects.toThrow(ServiceUnavailableException);
    await expect(failure).rejects.toMatchObject({
      response: {
        code: 'NOT_READY',
        message: 'A aplicação não está pronta: o banco de dados não responde.',
      },
    });
  });
});
