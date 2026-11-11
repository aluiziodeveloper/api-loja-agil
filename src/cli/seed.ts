import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { seedDemoStore } from '../seed/seed-demo-store.js';

/**
 * A loja de demonstração no banco de desenvolvimento:
 * `npm run build && npm run db:seed`. Pode rodar de novo sem duplicar nada.
 */
async function seed(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error'],
  });
  try {
    const report = await seedDemoStore((type) => app.get(type));
    process.stdout.write(`${report.join('\n')}\n`);
  } finally {
    await app.close();
  }
}

await seed();
