import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../shared/infrastructure/auth/public.decorator.js';

export type HealthStatus = {
  status: 'ok';
  uptimeInSeconds: number;
};

@ApiTags('Saúde')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check(): HealthStatus {
    return {
      status: 'ok',
      uptimeInSeconds: Math.floor(process.uptime()),
    };
  }
}
