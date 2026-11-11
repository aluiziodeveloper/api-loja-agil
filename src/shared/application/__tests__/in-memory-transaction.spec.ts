import {
  InMemoryTransaction,
  type Restorable,
} from './in-memory-transaction.js';

/** Um "banco" de um valor só, que sabe voltar a um ponto anterior. */
class Counter implements Restorable {
  value = 0;

  checkpoint(): () => void {
    const saved = this.value;
    return () => {
      this.value = saved;
    };
  }
}

describe('InMemoryTransaction', () => {
  let counter: Counter;
  let transaction: InMemoryTransaction;

  beforeEach(() => {
    counter = new Counter();
    transaction = new InMemoryTransaction([counter]);
  });

  it('should keep the changes and return the result when the work succeeds', async () => {
    const result = await transaction.run(async () => {
      counter.value = 1;
      return 'ok';
    });

    expect(result).toBe('ok');
    expect(counter.value).toBe(1);
  });

  it('should undo the changes and rethrow when the work fails', async () => {
    const failure = new Error('falhou no meio');

    await expect(
      transaction.run(async () => {
        counter.value = 1;
        throw failure;
      }),
    ).rejects.toBe(failure);
    expect(counter.value).toBe(0);
  });
});
