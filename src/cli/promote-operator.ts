import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { PromoteToOperatorUseCase } from '../identity/application/use-cases/promote-to-operator.use-case.js';
import { DomainError } from '../shared/domain/domain-error.js';

/** Um erro de domínio é um uso errado do comando: mensagem curta e saída 1. */
function reportFailure(error: unknown): void {
  if (!(error instanceof DomainError)) {
    throw error;
  }
  process.stderr.write(`${error.code}: ${error.message}\n`);
  process.exitCode = 1;
}

/**
 * O primeiro operador não tem quem o promova pela API. Quem tem acesso ao
 * servidor roda: `npm run operator:promote -- ana@loja.dev`. Usa o mesmo
 * caso de uso da rota POST /operators, sem subir o servidor HTTP.
 */
async function promoteOperator(email = ''): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error'],
  });
  try {
    const user = await app.get(PromoteToOperatorUseCase).execute({ email });
    process.stdout.write(
      `${user.name} <${user.email}> agora é ${user.role}.\n`,
    );
  } catch (error) {
    reportFailure(error);
  } finally {
    await app.close();
  }
}

await promoteOperator(process.argv[2]);
