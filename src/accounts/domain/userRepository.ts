import type { NewUser, StoredUser, User } from './user.js';

export abstract class UserRepository {
  abstract create(newUser: NewUser): Promise<User>;
  abstract findByEmail(email: string): Promise<StoredUser | null>;
  abstract findByGoogleId(googleId: string): Promise<StoredUser | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract linkGoogleAccount(userId: string, googleId: string): Promise<void>;
  abstract updatePasswordHash(userId: string, passwordHash: string): Promise<void>;
  abstract updateProfile(userId: string, changes: { name?: string; avatarKey?: string }): Promise<User | null>;
}
