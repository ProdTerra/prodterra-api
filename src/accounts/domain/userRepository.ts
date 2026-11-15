import type { NewUser, StoredUser, User } from './user.js';

export abstract class UserRepository {
  abstract create(newUser: NewUser): Promise<User>;
  abstract findByEmail(email: string): Promise<StoredUser | null>;
  abstract findById(id: string): Promise<User | null>;
}
