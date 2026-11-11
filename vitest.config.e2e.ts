import { defineConfig } from 'vitest/config';

/**
 * Testes end-to-end: a aplicação inteira, pelo HTTP, contra o banco de testes
 * (nunca o de desenvolvimento), um arquivo de cada vez.
 */
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.e2e-spec.ts'],
    globalSetup: ['test/setup/migrate-test-database.ts'],
    env: { DATABASE_URL: process.env.DATABASE_URL_TEST ?? '' },
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.controller.ts'],
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
