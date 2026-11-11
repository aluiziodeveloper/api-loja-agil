import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { Public } from '../shared/infrastructure/auth/public.decorator.js';
import { ApiData } from '../shared/infrastructure/openapi/api-docs.decorators.js';

export const healthStatus = z.object({
  status: z.literal('ok'),
  uptimeInSeconds: z.number().int(),
});

export type HealthStatus = z.infer<typeof healthStatus>;

@ApiTags('Saúde')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Diz se a aplicação está no ar.' })
  @ApiData(healthStatus)
  check(): HealthStatus {
    return {
      status: 'ok',
      uptimeInSeconds: Math.floor(process.uptime()),
    };
  }
}
