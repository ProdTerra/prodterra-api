import {
  InMemoryPasswordResetRepository,
  InMemorySessionRepository,
  InMemoryUserRepository,
  RecordingMailSender,
} from '../../../test/support/inMemoryAccountRepositories.js';
import { InvalidPasswordResetError } from '../domain/accountErrors.js';
import { Argon2PasswordHasher } from '../infrastructure/argon2PasswordHasher.js';
import { AccountMailer } from './accountMailer.js';
import { PasswordResetService } from './passwordReset.service.js';
import { hashSessionToken } from './sessionToken.js';
import { WebAppSettings } from './webAppSettings.js';

const now = new Date('2026-11-15T12:00:00Z');
const oneHourLater = new Date('2026-11-15T13:00:01Z');

async function createPasswordResetService() {
  const userRepository = new InMemoryUserRepository();
  const passwordResetRepository = new InMemoryPasswordResetRepository();
  const sessionRepository = new InMemorySessionRepository();
  const passwordHasher = new Argon2PasswordHasher();
  const mailSender = new RecordingMailSender();
  const accountMailer = new AccountMailer(mailSender, new WebAppSettings('https://app.prodterra.earth'));
  const user = await userRepository.create({ name: 'Ana', email: 'ana@example.com', passwordHash: await passwordHasher.hash('old-password'), googleId: null });
  const service = new PasswordResetService(userRepository, passwordResetRepository, sessionRepository, passwordHasher, accountMailer);
  return { user, userRepository, passwordResetRepository, sessionRepository, passwordHasher, mailSender, service };
}

function tokenFromEmail(text: string): string {
  return new URL(text.match(/https:\/\/\S+/)![0]).searchParams.get('token')!;
}

describe('PasswordResetService', () => {
  it('emails a link to the reset page and stores only the hash of its token', async () => {
    const { passwordResetRepository, mailSender, service } = await createPasswordResetService();
    await service.requestReset('ana@example.com', 'es', now);
    expect(mailSender.sentMessages).toHaveLength(1);
    expect(mailSender.sentMessages[0].text).toContain('https://app.prodterra.earth/reset-password?token=');
    const token = tokenFromEmail(mailSender.sentMessages[0].text);
    expect(passwordResetRepository.storedPasswordResets).toEqual([
      { tokenHash: hashSessionToken(token), userId: expect.any(String), expiresAt: new Date('2026-11-15T13:00:00Z') },
    ]);
  });

  it('sends nothing and reveals nothing for an unknown email', async () => {
    const { passwordResetRepository, mailSender, service } = await createPasswordResetService();
    await expect(service.requestReset('nobody@example.com', 'es', now)).resolves.toBeUndefined();
    expect(mailSender.sentMessages).toEqual([]);
    expect(passwordResetRepository.storedPasswordResets).toEqual([]);
  });

  it('changes the password once, ends every session and sends a notification', async () => {
    const { user, userRepository, sessionRepository, passwordHasher, mailSender, service } = await createPasswordResetService();
    await sessionRepository.create({ tokenHash: 'other-device', userId: user.id, createdAt: now, expiresAt: oneHourLater });
    await service.requestReset('ana@example.com', 'en', now);
    const token = tokenFromEmail(mailSender.sentMessages[0].text);

    await expect(service.resetPassword(token, 'new-password', 'en', now)).resolves.toEqual(user);

    expect(await passwordHasher.verify(userRepository.storedUsers[0].passwordHash!, 'new-password')).toBe(true);
    expect(sessionRepository.storedSessions).toEqual([]);
    expect(mailSender.sentMessages[1].subject).toBe('Your ProdTerra password changed');
    await expect(service.resetPassword(token, 'another-password', 'en', now)).rejects.toThrow(InvalidPasswordResetError);
  });

  it('rejects an expired or made up link', async () => {
    const { mailSender, service } = await createPasswordResetService();
    await service.requestReset('ana@example.com', 'es', now);
    const token = tokenFromEmail(mailSender.sentMessages[0].text);
    await expect(service.resetPassword(token, 'new-password', 'es', oneHourLater)).rejects.toThrow(InvalidPasswordResetError);
    await expect(service.resetPassword('not-a-token', 'new-password', 'es', now)).rejects.toThrow(InvalidPasswordResetError);
  });
});
