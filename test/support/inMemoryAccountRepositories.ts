import { DuplicateEmailError } from '../../src/accounts/domain/accountErrors.js';
import type { MailMessage } from '../../src/accounts/domain/mailSender.js';
import { MailSender } from '../../src/accounts/domain/mailSender.js';
import type { PasswordReset } from '../../src/accounts/domain/passwordReset.js';
import { PasswordResetRepository } from '../../src/accounts/domain/passwordResetRepository.js';
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

  async findByGoogleId(googleId: string): Promise<StoredUser | null> {
    return this.storedUsers.find((storedUser) => storedUser.googleId === googleId) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const storedUser = this.storedUsers.find((candidate) => candidate.id === id);
    return storedUser ? withoutPasswordHash(storedUser) : null;
  }

  async linkGoogleAccount(userId: string, googleId: string): Promise<void> {
    this.update(userId, { googleId });
  }

  async updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
    this.update(userId, { passwordHash });
  }

  private update(userId: string, changes: Partial<StoredUser>): void {
    const index = this.storedUsers.findIndex((storedUser) => storedUser.id === userId);
    if (index >= 0) {
      this.storedUsers[index] = { ...this.storedUsers[index], ...changes };
    }
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

  async deleteByUserId(userId: string): Promise<void> {
    this.storedSessions.splice(0, this.storedSessions.length, ...this.storedSessions.filter((session) => session.userId !== userId));
  }
}

export class InMemoryPasswordResetRepository extends PasswordResetRepository {
  readonly storedPasswordResets: PasswordReset[] = [];

  async create(passwordReset: PasswordReset): Promise<void> {
    this.storedPasswordResets.push(passwordReset);
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordReset | null> {
    return this.storedPasswordResets.find((passwordReset) => passwordReset.tokenHash === tokenHash) ?? null;
  }

  async deleteByUserId(userId: string): Promise<void> {
    const remaining = this.storedPasswordResets.filter((passwordReset) => passwordReset.userId !== userId);
    this.storedPasswordResets.splice(0, this.storedPasswordResets.length, ...remaining);
  }
}

export class RecordingMailSender extends MailSender {
  readonly sentMessages: MailMessage[] = [];

  async send(message: MailMessage): Promise<void> {
    this.sentMessages.push(message);
  }
}
