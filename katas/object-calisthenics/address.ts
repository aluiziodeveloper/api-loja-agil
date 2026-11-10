import { Money } from './money.js';

const HOME_STATE = 'SP';
const HOME_STATE_SHIPPING_FEE = Money.ofCents(1000);
const OTHER_STATES_SHIPPING_FEE = Money.ofCents(2500);

export class Address {
  private constructor(private readonly state: string) {}

  static inState(state: string): Address {
    return new Address(state);
  }

  standardShippingFee(): Money {
    if (this.state === HOME_STATE) {
      return HOME_STATE_SHIPPING_FEE;
    }
    return OTHER_STATES_SHIPPING_FEE;
  }
}
