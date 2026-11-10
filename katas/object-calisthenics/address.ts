export class Address {
  private constructor(private readonly state: string) {}

  static inState(state: string): Address {
    return new Address(state);
  }

  isIn(state: string): boolean {
    return this.state === state;
  }
}
