import { provideUseCase } from './provide-use-case.js';

abstract class Clock {
  abstract now(): Date;
}

abstract class Greeter {
  abstract greet(name: string): string;
}

class GreetUseCase {
  constructor(
    readonly clock: Clock,
    readonly greeter: Greeter,
  ) {}
}

describe('provideUseCase', () => {
  const provider = provideUseCase(GreetUseCase, [Clock, Greeter]);

  it('should register the use case under its own class', () => {
    expect(provider.provide).toBe(GreetUseCase);
    expect(provider.inject).toEqual([Clock, Greeter]);
  });

  it('should build it with the dependencies in the order of the constructor', () => {
    const clock = { now: () => new Date() };
    const greeter = { greet: (name: string) => `Olá, ${name}` };

    const useCase = provider.useFactory(clock, greeter);

    expect(useCase).toBeInstanceOf(GreetUseCase);
    expect(useCase.clock).toBe(clock);
    expect(useCase.greeter).toBe(greeter);
  });

  it('should not compile with the tokens out of order', () => {
    // Quem confere é o `npm run typecheck`: sem o erro, a diretiva é que falha.
    // @ts-expect-error: Greeter não serve onde o construtor espera um Clock.
    const wrong = provideUseCase(GreetUseCase, [Greeter, Clock]);

    expect(wrong.inject).toEqual([Greeter, Clock]);
  });
});
