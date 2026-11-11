import { defineConfig } from 'vitest/config';

/**
 * Testes de integração: rodam contra o banco de testes, um arquivo de cada vez
 * (todos usam as mesmas tabelas), e medem a cobertura da infraestrutura.
 */
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.int-spec.ts'],
    globalSetup: ['test/setup/migrate-test-database.ts'],
    env: { DATABASE_URL: process.env.DATABASE_URL_TEST ?? '' },
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      include: ['src/**/infrastructure/**/*.ts'],
      exclude: [
        'src/**/__tests__/**',
        '**/*.int-spec.ts',
        'src/**/*.module.ts',
      ],
      reportsDirectory: 'coverage/integration',
      reporter: ['text', 'html', 'lcov'],
      thresholds: { lines: 90, functions: 90, branches: 90, statements: 90 },
    },
  },
});
