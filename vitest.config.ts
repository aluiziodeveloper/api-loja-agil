import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/__tests__/**',
        'src/**/*.spec.ts',
        'src/**/*.module.ts',
        'src/main.ts',
      ],
      reporter: ['text', 'html', 'lcov'],
    },
  },
});
