import { Injectable } from '@nestjs/common';
import { isSessionActive, sessionLifetimeInMilliseconds } from '../domain/session.js';
import { SessionRepository } from '../domain/sessionRepository.js';
import type { User } from '../domain/user.js';
import { UserRepository } from '../domain/userRepository.js';
import { generateSessionToken, hashSessionToken, isWellFormedSessionToken } from './sessionToken.js';

export type StartedSession = { token: string; expiresAt: Date };

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async start(userId: string, now: Date): Promise<StartedSession> {
    const token = generateSessionToken();
    const expiresAt = new Date(now.getTime() + sessionLifetimeInMilliseconds);
    await this.sessionRepository.create({ tokenHash: hashSessionToken(token), userId, createdAt: now, expiresAt });
    return { token, expiresAt };
  }

  async findUser(token: string | undefined, now: Date): Promise<User | null> {
    if (!isWellFormedSessionToken(token)) {
      return null;
    }
    const session = await this.sessionRepository.findByTokenHash(hashSessionToken(token));
    if (!session || !isSessionActive(session, now)) {
      return null;
    }
    return this.userRepository.findById(session.userId);
  }

  async end(token: string | undefined): Promise<void> {
    if (!isWellFormedSessionToken(token)) {
      return;
    }
    await this.sessionRepository.deleteByTokenHash(hashSessionToken(token));
  }
}
