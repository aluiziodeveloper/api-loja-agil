import { defineConfig } from 'vitest/config';
import { E2E_WORKERS } from './test/setup/e2e-databases.js';

/**
 * Testes end-to-end: a aplicação inteira, pelo HTTP, contra bancos de teste
 * (nunca o de desenvolvimento), em paralelo, um banco por worker.
 */
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.e2e-spec.ts'],
    globalSetup: ['test/setup/migrate-e2e-databases.ts'],
    setupFiles: ['test/setup/use-worker-database.ts'],
    maxWorkers: E2E_WORKERS,
    env: {
      JWT_SECRET: 'e2e-secret-with-at-least-32-characters',
    },
    coverage: {
      provider: 'v8',
      include: [
        'src/**/*.controller.ts',
        'src/shared/infrastructure/openapi/open-api.ts',
        'src/shared/infrastructure/openapi/api-docs.decorators.ts',
      ],
      reportsDirectory: 'coverage/e2e',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
