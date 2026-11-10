/**
 * Regras de arquitetura verificadas no CI (ADR 0002).
 * Contextos: identity, catalog, inventory, ordering. Shared Kernel: shared.
 */
const contexts = '(identity|catalog|inventory|ordering)';
/** Arquivos de teste: specs e utilitários em pastas __tests__ (builders, fakes). */
const testCode = '(\\.(spec|int-spec|e2e-spec)\\.ts$|/__tests__/)';

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'domain-is-pure',
      comment:
        'O domínio só depende do próprio domínio e do shared/domain. Nada de framework, ORM ou bibliotecas.',
      severity: 'error',
      from: { path: '^src/([^/]+)/domain/', pathNot: testCode },
      to: {
        pathNot: ['^src/$1/domain/', '^src/shared/domain/'],
        dependencyTypesNot: ['core'],
      },
    },
    {
      name: 'application-depends-on-domain-only',
      comment:
        'Casos de uso dependem apenas de domínio e aplicação; a infraestrutura chega por injeção de dependência.',
      severity: 'error',
      from: { path: '^src/([^/]+)/application/' },
      to: {
        pathNot: [
          '^src/$1/(domain|application)/',
          '^src/shared/(domain|application)/',
        ],
        dependencyTypesNot: ['core'],
      },
    },
    {
      name: 'no-cross-context-imports',
      comment:
        'Um bounded context não importa código de outro; integração por portas e eventos.',
      severity: 'error',
      from: { path: `^src/${contexts}/` },
      to: { path: `^src/${contexts}/`, pathNot: '^src/$1/' },
    },
    {
      name: 'shared-is-context-agnostic',
      comment: 'O Shared Kernel não pode conhecer nenhum bounded context.',
      severity: 'error',
      from: { path: '^src/shared/' },
      to: { path: `^src/${contexts}/` },
    },
    {
      name: 'no-test-code-in-production',
      comment: 'Código de produção não importa arquivos de teste.',
      severity: 'error',
      from: { pathNot: testCode },
      to: { path: testCode },
    },
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
  },
};
