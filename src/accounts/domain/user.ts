export type User = {
  id: string;
  name: string;
  email: string;
  avatarKey: string | null;
};

export type StoredUser = User & {
  passwordHash: string | null;
  googleId: string | null;
};

export type NewUser = {
  name: string;
  email: string;
  avatarKey: string;
  passwordHash: string | null;
  googleId: string | null;
};

export function withoutPasswordHash(storedUser: StoredUser): User {
  return { id: storedUser.id, name: storedUser.name, email: storedUser.email, avatarKey: storedUser.avatarKey };
}
