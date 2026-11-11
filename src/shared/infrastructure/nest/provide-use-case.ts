import type { FactoryProvider, InjectionToken } from '@nestjs/common';

/** O token de uma porta: a classe abstrata (ou concreta) que a representa. */
type Token<Instance> = abstract new (...args: never[]) => Instance;

/** Um token para cada parâmetro do construtor, na mesma ordem e do mesmo tipo. */
type TokensOf<Params extends unknown[]> = {
  [Index in keyof Params]: Token<Params[Index]>;
};

type UseCaseProvider<Params extends unknown[], Instance> = Omit<
  FactoryProvider<Instance>,
  'useFactory'
> & {
  useFactory: (...resolved: Params) => Instance;
};

/**
 * O caso de uso continua sem decorators: o Nest só o constrói, entregando as
 * dependências na ordem do construtor. Trocar a ordem é erro de compilação.
 */
export function provideUseCase<Params extends unknown[], Instance>(
  useCase: new (...dependencies: Params) => Instance,
  dependencies: TokensOf<Params>,
): UseCaseProvider<Params, Instance> {
  return {
    provide: useCase,
    useFactory: (...resolved: Params) => new useCase(...resolved),
    inject: dependencies as InjectionToken[],
  };
}
