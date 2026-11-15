import { Injectable } from '@nestjs/common';
import { InvalidPasswordResetError } from '../domain/accountErrors.js';
import type { Locale } from '../domain/locale.js';
import { PasswordHasher } from '../domain/passwordHasher.js';
import { isPasswordResetActive, passwordResetLifetimeInMilliseconds } from '../domain/passwordReset.js';
import { PasswordResetRepository } from '../domain/passwordResetRepository.js';
import { SessionRepository } from '../domain/sessionRepository.js';
import { withoutPasswordHash, type User } from '../domain/user.js';
import { UserRepository } from '../domain/userRepository.js';
import { AccountMailer } from './accountMailer.js';
import { generateSessionToken, hashSessionToken, isWellFormedSessionToken } from './sessionToken.js';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordResetRepository: PasswordResetRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly accountMailer: AccountMailer,
  ) {}

  async requestReset(email: string, locale: Locale, now: Date): Promise<void> {
    const storedUser = await this.userRepository.findByEmail(email);
    if (!storedUser) {
      return;
    }
    const token = generateSessionToken();
    await this.passwordResetRepository.deleteByUserId(storedUser.id);
    await this.passwordResetRepository.create({
      tokenHash: hashSessionToken(token),
      userId: storedUser.id,
      expiresAt: new Date(now.getTime() + passwordResetLifetimeInMilliseconds),
    });
    await this.accountMailer.sendPasswordReset(withoutPasswordHash(storedUser), token, locale);
  }

  async resetPassword(token: string, newPassword: string, locale: Locale, now: Date): Promise<User> {
    if (!isWellFormedSessionToken(token)) {
      throw new InvalidPasswordResetError();
    }
    const passwordReset = await this.passwordResetRepository.findByTokenHash(hashSessionToken(token));
    if (!passwordReset || !isPasswordResetActive(passwordReset, now)) {
      throw new InvalidPasswordResetError();
    }
    const user = await this.userRepository.findById(passwordReset.userId);
    if (!user) {
      throw new InvalidPasswordResetError();
    }
    await this.passwordResetRepository.deleteByUserId(user.id);
    await this.userRepository.updatePasswordHash(user.id, await this.passwordHasher.hash(newPassword));
    await this.sessionRepository.deleteByUserId(user.id);
    await this.accountMailer.sendPasswordChanged(user, locale);
    return user;
  }
}
