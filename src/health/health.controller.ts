import { Controller, Get } from '@nestjs/common';

export type HealthStatus = {
  status: 'ok';
  uptimeInSeconds: number;
};

@Controller('health')
export class HealthController {
  @Get()
  check(): HealthStatus {
    return {
      status: 'ok',
      uptimeInSeconds: Math.floor(process.uptime()),
    };
  }
}
