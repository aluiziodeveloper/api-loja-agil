import { AggregateRoot } from '../../shared/domain/aggregate-root.js';
import { UniqueId } from '../../shared/domain/unique-id.value-object.js';
import { Email } from './email.value-object.js';
import { Name } from './name.value-object.js';
import { PasswordHash } from './password-hash.value-object.js';
import type { PasswordVerifier } from './password-verifier.js';
import type { Password } from './password.value-object.js';
import { Role } from './role.js';
import { UserRegistered } from './user-registered.event.js';

type UserProps = {
  name: Name;
  email: Email;
  passwordHash: PasswordHash;
  role: Role;
};

export type RegisterUserProps = Omit<UserProps, 'role'>;

export type UserSnapshot = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
};

export class User extends AggregateRoot {
  private constructor(
    id: UniqueId,
    private props: UserProps,
  ) {
    super(id);
  }

  static register(props: RegisterUserProps): User {
    const user = new User(UniqueId.create(), {
      ...props,
      role: Role.CUSTOMER,
    });
    user.record(new UserRegistered(user.id.toString(), props.email.toString()));
    return user;
  }

  static restore(snapshot: UserSnapshot): User {
    return new User(UniqueId.from(snapshot.id), {
      name: Name.create(snapshot.name),
      email: Email.create(snapshot.email),
      passwordHash: PasswordHash.fromHash(snapshot.passwordHash),
      role: snapshot.role,
    });
  }

  rename(name: Name): void {
    this.props = { ...this.props, name };
  }

  changeEmail(email: Email): void {
    this.props = { ...this.props, email };
  }

  changePassword(passwordHash: PasswordHash): void {
    this.props = { ...this.props, passwordHash };
  }

  hasEmail(email: Email): boolean {
    return this.props.email.equals(email);
  }

  authenticate(
    password: Password,
    verifier: PasswordVerifier,
  ): Promise<boolean> {
    return verifier.verify(password, this.props.passwordHash);
  }

  toSnapshot(): UserSnapshot {
    return {
      id: this.id.toString(),
      name: this.props.name.toString(),
      email: this.props.email.toString(),
      passwordHash: this.props.passwordHash.toString(),
      role: this.props.role,
    };
  }
}
