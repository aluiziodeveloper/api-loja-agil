import { execSync } from 'node:child_process';

/** Antes da suíte: aplica as migrations no banco de testes, nunca no de desenvolvimento. */
export default function setup(): void {
  const url = process.env.DATABASE_URL_TEST;
  if (!url) {
    throw new Error('DATABASE_URL_TEST is not set');
  }
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: url },
  });
}
