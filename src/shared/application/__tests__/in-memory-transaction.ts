import type { Transaction } from '../transaction.js';

/** Um fake que sabe voltar atrás: `checkpoint` guarda o estado e devolve como desfazer. */
export interface Restorable {
  checkpoint(): () => void;
}

/**
 * O rollback dos fakes: antes do trabalho, marca um ponto em cada um; se o
 * trabalho falhar, volta todos a esse ponto. O banco real faz isso sozinho.
 */
export class InMemoryTransaction implements Transaction {
  constructor(private readonly stores: Restorable[]) {}

  async run<Result>(work: () => Promise<Result>): Promise<Result> {
    const rollbacks = this.stores.map((store) => store.checkpoint());
    try {
      return await work();
    } catch (error) {
      rollbacks.forEach((rollback) => rollback());
      throw error;
    }
  }
}
