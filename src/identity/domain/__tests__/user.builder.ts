import { faker } from '@faker-js/faker';

import { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import { Role } from '../role.js';
import { User, type UserSnapshot } from '../user.entity.js';

export class UserBuilder {
  private snapshot: UserSnapshot = {
    id: UniqueId.create().toString(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    passwordHash: `hashed:${faker.internet.password()}`,
    role: Role.CUSTOMER,
  };

  withName(name: string): this {
    return this.with({ name });
  }

  withEmail(email: string): this {
    return this.with({ email });
  }

  withPasswordHash(passwordHash: string): this {
    return this.with({ passwordHash });
  }

  withRole(role: Role): this {
    return this.with({ role });
  }

  build(): User {
    return User.restore(this.snapshot);
  }

  private with(changes: Partial<UserSnapshot>): this {
    this.snapshot = { ...this.snapshot, ...changes };
    return this;
  }
}

export function aUser(): UserBuilder {
  return new UserBuilder();
}
