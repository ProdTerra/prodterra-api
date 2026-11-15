import { InMemorySessionRepository, InMemoryUserRepository } from '../../../test/support/inMemoryAccountRepositories.js';
import { sessionLifetimeInMilliseconds } from '../domain/session.js';
import { SessionService } from './session.service.js';
import { hashSessionToken } from './sessionToken.js';

const startTime = new Date('2026-11-14T12:00:00Z');

async function createSessionServiceWithUser() {
  const userRepository = new InMemoryUserRepository();
  const sessionRepository = new InMemorySessionRepository();
  const user = await userRepository.create({ name: 'Ana', email: 'ana@example.com', passwordHash: 'hash', googleId: null });
  return { user, sessionRepository, sessionService: new SessionService(sessionRepository, userRepository) };
}

describe('SessionService', () => {
  it('stores only the SHA-256 hash of the session token', async () => {
    const { user, sessionRepository, sessionService } = await createSessionServiceWithUser();
    const { token } = await sessionService.start(user.id, startTime);
    const storedSession = sessionRepository.storedSessions[0];
    expect(storedSession.tokenHash).toBe(hashSessionToken(token));
    expect(JSON.stringify(sessionRepository.storedSessions)).not.toContain(token);
    expect(await sessionService.findUser(token, startTime)).toEqual(user);
  });

  it('treats an expired session as anonymous', async () => {
    const { user, sessionService } = await createSessionServiceWithUser();
    const { token } = await sessionService.start(user.id, startTime);
    const afterExpiry = new Date(startTime.getTime() + sessionLifetimeInMilliseconds);
    expect(await sessionService.findUser(token, afterExpiry)).toBeNull();
  });

  it('deletes the session on logout', async () => {
    const { user, sessionRepository, sessionService } = await createSessionServiceWithUser();
    const { token } = await sessionService.start(user.id, startTime);
    await sessionService.end(token);
    expect(sessionRepository.storedSessions).toHaveLength(0);
    expect(await sessionService.findUser(token, startTime)).toBeNull();
  });
});
