import { execSync } from 'node:child_process';
import { E2E_WORKERS, e2eDatabaseUrl } from './e2e-databases.js';

/** Antes da suíte: um banco por worker, com as migrations aplicadas. */
export default function setup(): void {
  for (let worker = 1; worker <= E2E_WORKERS; worker++) {
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: e2eDatabaseUrl(worker) },
    });
  }
}
