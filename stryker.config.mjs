/**
 * Teste de mutação: o Stryker muda o código (um `<` vira `<=`, um `if`
 * vira `true`) e roda os testes de unidade. Se nenhum teste falhar, o
 * mutante sobreviveu: a linha estava coberta, mas não verificada.
 *
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
export default {
  testRunner: 'vitest',
  vitest: { configFile: 'vitest.config.ts' },
  // Onde moram as regras: domínio e casos de uso. Portas são só contratos.
  mutate: [
    'src/**/domain/**/*.ts',
    'src/**/application/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/__tests__/**',
    '!src/**/application/ports/**',
  ],
  coverageAnalysis: 'perTest',
  // Abaixo de 100%, o job falha: cada mutante que sobrevive vira um teste
  // ou um `Stryker disable` com o motivo, revisado no PR.
  thresholds: { high: 100, low: 95, break: 100 },
  // Mutante que não compila não conta: o TypeScript já o recusaria.
  checkers: ['typescript'],
  tsconfigFile: 'tsconfig.json',
  reporters: ['clear-text', 'progress', 'html', 'json'],
  htmlReporter: { fileName: 'reports/mutation/index.html' },
  jsonReporter: { fileName: 'reports/mutation/mutation.json' },
};
