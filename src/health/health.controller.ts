import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { Public } from '../shared/infrastructure/auth/public.decorator.js';
import { PrismaDatabase } from '../shared/infrastructure/database/prisma-database.js';
import {
  ApiData,
  ApiErrors,
} from '../shared/infrastructure/openapi/api-docs.decorators.js';

export const healthStatus = z.object({
  status: z.literal('ok'),
  uptimeInSeconds: z.number().int(),
});

export const readinessStatus = z.object({
  status: z.literal('ready'),
  checks: z.object({ database: z.literal('up') }),
});

export type HealthStatus = z.infer<typeof healthStatus>;

export type ReadinessStatus = z.infer<typeof readinessStatus>;

/** O que a prontidão precisa do banco: só saber se ele responde. */
type DatabasePing = Pick<PrismaDatabase, 'ping'>;

/**
 * Duas perguntas diferentes da plataforma. `/health`: o processo está vivo?
 * Se não, reinicie. `/health/ready`: pode receber tráfego? Se não, espere.
 * Reiniciar a aplicação porque o banco caiu não traz o banco de volta.
 */
@ApiTags('Saúde')
@Controller('health')
export class HealthController {
  constructor(
    @Inject(PrismaDatabase) private readonly database: DatabasePing,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Diz se o processo está vivo.' })
  @ApiData(healthStatus)
  check(): HealthStatus {
    return {
      status: 'ok',
      uptimeInSeconds: Math.floor(process.uptime()),
    };
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Diz se a aplicação pode receber tráfego.' })
  @ApiData(readinessStatus)
  @ApiErrors('NOT_READY')
  async ready(): Promise<ReadinessStatus> {
    try {
      await this.database.ping();
    } catch {
      throw new ServiceUnavailableException({
        code: 'NOT_READY',
        message: 'A aplicação não está pronta: o banco de dados não responde.',
      });
    }
    return { status: 'ready', checks: { database: 'up' } };
  }
}
