import type { Address } from './address.js';

export class Customer {
  private constructor(
    private readonly vip: boolean,
    private readonly address: Address,
  ) {}

  static of(vip: boolean, address: Address): Customer {
    return new Customer(vip, address);
  }

  isVip(): boolean {
    return this.vip;
  }

  livesIn(state: string): boolean {
    return this.address.isIn(state);
  }
}
