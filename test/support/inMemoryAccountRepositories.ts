import { DuplicateEmailError } from '../../src/accounts/domain/accountErrors.js';
import type { Session } from '../../src/accounts/domain/session.js';
import { SessionRepository } from '../../src/accounts/domain/sessionRepository.js';
import { withoutPasswordHash, type NewUser, type StoredUser, type User } from '../../src/accounts/domain/user.js';
import { UserRepository } from '../../src/accounts/domain/userRepository.js';

export class InMemoryUserRepository extends UserRepository {
  readonly storedUsers: StoredUser[] = [];

  async create(newUser: NewUser): Promise<User> {
    if (this.storedUsers.some((storedUser) => storedUser.email === newUser.email)) {
      throw new DuplicateEmailError();
    }
    const storedUser = { id: `user-${this.storedUsers.length + 1}`, ...newUser };
    this.storedUsers.push(storedUser);
    return withoutPasswordHash(storedUser);
  }

  async findByEmail(email: string): Promise<StoredUser | null> {
    return this.storedUsers.find((storedUser) => storedUser.email === email) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const storedUser = this.storedUsers.find((candidate) => candidate.id === id);
    return storedUser ? withoutPasswordHash(storedUser) : null;
  }
}

export class InMemorySessionRepository extends SessionRepository {
  readonly storedSessions: Session[] = [];

  async create(session: Session): Promise<void> {
    this.storedSessions.push(session);
  }

  async findByTokenHash(tokenHash: string): Promise<Session | null> {
    return this.storedSessions.find((session) => session.tokenHash === tokenHash) ?? null;
  }

  async deleteByTokenHash(tokenHash: string): Promise<void> {
    const index = this.storedSessions.findIndex((session) => session.tokenHash === tokenHash);
    if (index >= 0) {
      this.storedSessions.splice(index, 1);
    }
  }
}
