export type Session = {
  tokenHash: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
};

export const sessionLifetimeInMilliseconds = 30 * 24 * 60 * 60 * 1000;

export function isSessionActive(session: Session, now: Date): boolean {
  return session.expiresAt.getTime() > now.getTime();
}
