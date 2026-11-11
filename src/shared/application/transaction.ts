/**
 * Porta: tudo o que o trabalho grava fica gravado junto, ou nada fica. Se o
 * trabalho falhar, as gravações são desfeitas e o erro chega a quem chamou.
 */
export abstract class Transaction {
  abstract run<Result>(work: () => Promise<Result>): Promise<Result>;
}
