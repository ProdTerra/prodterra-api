export type PasswordReset = {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
};

export const passwordResetLifetimeInMilliseconds = 60 * 60 * 1000;

export function isPasswordResetActive(passwordReset: PasswordReset, now: Date): boolean {
  return passwordReset.expiresAt.getTime() > now.getTime();
}
