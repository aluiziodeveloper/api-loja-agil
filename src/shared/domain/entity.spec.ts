import { Entity } from './entity.js';
import { UniqueId } from './unique-id.value-object.js';

class Customer extends Entity {
  constructor(
    id: UniqueId,
    private name: string,
  ) {
    super(id);
  }

  rename(name: string): void {
    this.name = name;
  }
}

class Supplier extends Entity {
  constructor(id: UniqueId) {
    super(id);
  }
}

describe('Entity', () => {
  it('should be equal to another instance with the same id', () => {
    const id = UniqueId.create();
    const first = new Customer(id, 'Ana');
    const second = new Customer(UniqueId.from(id.toString()), 'Ana');

    expect(first.equals(second)).toBe(true);
  });

  it('should stay equal after its attributes change', () => {
    const id = UniqueId.create();
    const customer = new Customer(id, 'Ana');
    const sameCustomer = new Customer(id, 'Ana');

    customer.rename('Ana Paula');

    expect(customer.equals(sameCustomer)).toBe(true);
  });

  it('should not be equal to an entity with a different id', () => {
    const first = new Customer(UniqueId.create(), 'Ana');
    const second = new Customer(UniqueId.create(), 'Ana');

    expect(first.equals(second)).toBe(false);
  });

  it('should not be equal to a different entity type with the same id', () => {
    const id = UniqueId.create();
    const customer = new Customer(id, 'Ana');
    const supplier = new Supplier(id);

    expect(customer.equals(supplier)).toBe(false);
  });

  it('should not be equal to undefined', () => {
    const customer = new Customer(UniqueId.create(), 'Ana');

    expect(customer.equals(undefined)).toBe(false);
  });
});
