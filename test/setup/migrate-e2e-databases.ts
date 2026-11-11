import { execSync } from 'node:child_process';
import { E2E_WORKERS, e2eDatabaseUrl } from './e2e-databases.js';

/** Antes da suíte e2e: um banco por worker, criado e migrado pelo Prisma. */
export default function setup(): void {
  for (let worker = 1; worker <= E2E_WORKERS; worker++) {
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: e2eDatabaseUrl(worker) },
    });
  }
}
