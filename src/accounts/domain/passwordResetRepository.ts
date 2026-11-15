import type { PasswordReset } from './passwordReset.js';

export abstract class PasswordResetRepository {
  abstract create(passwordReset: PasswordReset): Promise<void>;
  abstract findByTokenHash(tokenHash: string): Promise<PasswordReset | null>;
  abstract deleteByUserId(userId: string): Promise<void>;
}
