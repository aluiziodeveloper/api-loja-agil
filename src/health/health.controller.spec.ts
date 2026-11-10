import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  it('should report the application as healthy', () => {
    const controller = new HealthController();

    const result = controller.check();

    expect(result.status).toBe('ok');
    expect(result.uptimeInSeconds).toBeGreaterThanOrEqual(0);
  });
});
