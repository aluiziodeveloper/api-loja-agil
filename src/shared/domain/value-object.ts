export abstract class ValueObject<Props extends object> {
  protected readonly props: Readonly<Props>;

  protected constructor(props: Props) {
    this.props = Object.freeze({ ...props });
  }

  equals(other?: ValueObject<Props>): boolean {
    if (other === undefined) {
      return false;
    }
    if (other.constructor !== this.constructor) {
      return false;
    }
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
