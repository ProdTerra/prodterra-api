import type { User } from '../domain/user.js';

export type UserResponse = { user: { id: string; name: string; email: string } };

export function toUserResponse(user: User): UserResponse {
  return { user: { id: user.id, name: user.name, email: user.email } };
}
