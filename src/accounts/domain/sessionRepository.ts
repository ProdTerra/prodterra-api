import type { Session } from './session.js';

export abstract class SessionRepository {
  abstract create(session: Session): Promise<void>;
  abstract findByTokenHash(tokenHash: string): Promise<Session | null>;
  abstract deleteByTokenHash(tokenHash: string): Promise<void>;
}
