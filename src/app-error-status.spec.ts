import { readdirSync, readFileSync } from 'node:fs';
import { appErrorStatus } from './app-error-status.js';

/** As linhas das tabelas de docs/error-codes.md: código e status HTTP. */
function documentedStatus(): Record<string, number> {
  const doc = readFileSync('docs/error-codes.md', 'utf8');
  const rows = doc.matchAll(/^\| `([A-Z_]+)` .*\| (\d{3}) +\|$/gm);
  return Object.fromEntries(
    [...rows].map(([, code, status]) => [code, Number(status)]),
  );
}

/** Os códigos declarados pelos erros de domínio e de aplicação, no código-fonte. */
function declaredCodes(): string[] {
  const files = readdirSync('src', { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.error.ts'))
    .filter((file) => !file.includes('infrastructure'));
  return files.flatMap((file) => {
    const source = readFileSync(`src/${file}`, 'utf8');
    return [...source.matchAll(/readonly code = '([A-Z_]+)'/g)].map(
      ([, code]) => code,
    );
  });
}

describe('appErrorStatus', () => {
  it('should use the status documented in docs/error-codes.md', () => {
    expect(appErrorStatus).toEqual(documentedStatus());
  });

  it('should give a status to every error code in the source', () => {
    expect(Object.keys(appErrorStatus)).toEqual(
      expect.arrayContaining(declaredCodes()),
    );
  });
});
