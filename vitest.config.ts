import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts', 'katas/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'katas/**/*.ts'],
      exclude: [
        'src/**/__tests__/**',
        'src/generated/**',
        '**/*.spec.ts',
        '**/*.int-spec.ts',
        'src/**/*.module.ts',
        'src/main.ts',
        // Medida pelos testes de integração, contra o banco (vitest.config.int.ts).
        'src/**/infrastructure/database/**',
        'src/**/infrastructure/persistence/**',
        // Contratos sem comportamento: classes abstratas que só servem de token.
        'src/**/application/ports/**',
        // Medidos pelos testes end-to-end, pelo HTTP (vitest.config.e2e.ts).
        'src/**/infrastructure/http/**/*.controller.ts',
      ],
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
        'src/**/domain/**': {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
      },
    },
  },
});
