export type User = {
  id: string;
  name: string;
  email: string;
};

export type StoredUser = User & {
  passwordHash: string;
};

export type NewUser = {
  name: string;
  email: string;
  passwordHash: string;
};

export function withoutPasswordHash(storedUser: StoredUser): User {
  return { id: storedUser.id, name: storedUser.name, email: storedUser.email };
}
