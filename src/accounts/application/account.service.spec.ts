import { InMemoryUserRepository, RecordingMailSender } from '../../../test/support/inMemoryAccountRepositories.js';
import { InvalidCredentialsError, UnverifiedGoogleEmailError } from '../domain/accountErrors.js';
import type { GoogleProfile } from '../domain/googleIdentityProvider.js';
import { Argon2PasswordHasher } from '../infrastructure/argon2PasswordHasher.js';
import { AccountMailer } from './accountMailer.js';
import { AccountService } from './account.service.js';
import { WebAppSettings } from './webAppSettings.js';

const registration = { name: 'Ana Solano', email: 'ana@example.com', password: 'cartago-2026' };
const googleProfile: GoogleProfile = { googleId: 'google-1', email: 'Ana@Example.com', isEmailVerified: true, name: 'Ana Solano' };

function createAccountService() {
  const userRepository = new InMemoryUserRepository();
  const passwordHasher = new Argon2PasswordHasher();
  const mailSender = new RecordingMailSender();
  const accountMailer = new AccountMailer(mailSender, new WebAppSettings('https://app.prodterra.earth'));
  return { userRepository, passwordHasher, mailSender, accountService: new AccountService(userRepository, passwordHasher, accountMailer) };
}

describe('AccountService', () => {
  it('stores an argon2id hash and never the plain password', async () => {
    const { userRepository, accountService } = createAccountService();
    const user = await accountService.register(registration, 'es');
    const storedUser = userRepository.storedUsers[0];
    expect(storedUser.passwordHash).not.toContain(registration.password);
    expect(storedUser.passwordHash?.startsWith('$argon2id$')).toBe(true);
    expect(user).not.toHaveProperty('passwordHash');
  });

  it('sends a welcome email in the farmer language after registering', async () => {
    const { mailSender, accountService } = createAccountService();
    await accountService.register(registration, 'en');
    expect(mailSender.sentMessages).toHaveLength(1);
    expect(mailSender.sentMessages[0]).toMatchObject({ to: 'ana@example.com', subject: 'Welcome to ProdTerra' });
    expect(mailSender.sentMessages[0].text).toContain('https://app.prodterra.earth/');
  });

  it('rejects a wrong password and an unknown email with the same error', async () => {
    const { passwordHasher, accountService } = createAccountService();
    await accountService.register(registration, 'es');
    const dummyVerification = vi.spyOn(passwordHasher, 'verifyAgainstDummyHash');

    await expect(accountService.authenticate({ email: registration.email, password: 'wrong-password' })).rejects.toThrow(
      InvalidCredentialsError,
    );
    await expect(accountService.authenticate({ email: 'nobody@example.com', password: 'whatever-1' })).rejects.toThrow(
      InvalidCredentialsError,
    );
    expect(dummyVerification).toHaveBeenCalledTimes(1);
  });

  it('creates an account without password the first time someone signs in with Google', async () => {
    const { userRepository, mailSender, accountService } = createAccountService();
    const user = await accountService.signInWithGoogle(googleProfile, 'es');
    expect(user).toEqual({ id: expect.any(String), name: 'Ana Solano', email: 'ana@example.com' });
    expect(userRepository.storedUsers[0]).toMatchObject({ passwordHash: null, googleId: 'google-1' });
    expect(mailSender.sentMessages[0].subject).toBe('Bienvenido a ProdTerra');
    await expect(accountService.authenticate({ email: 'ana@example.com', password: 'anything-1' })).rejects.toThrow(
      InvalidCredentialsError,
    );
  });

  it('links Google to an existing account with the same email and keeps its password', async () => {
    const { userRepository, accountService } = createAccountService();
    const registered = await accountService.register(registration, 'es');
    const signedIn = await accountService.signInWithGoogle(googleProfile, 'es');
    expect(signedIn.id).toBe(registered.id);
    expect(userRepository.storedUsers).toHaveLength(1);
    expect(userRepository.storedUsers[0].googleId).toBe('google-1');
    await expect(accountService.authenticate({ email: registration.email, password: registration.password })).resolves.toMatchObject({
      id: registered.id,
    });
  });

  it('refuses a Google email that Google did not verify', async () => {
    const { userRepository, accountService } = createAccountService();
    await expect(accountService.signInWithGoogle({ ...googleProfile, isEmailVerified: false }, 'es')).rejects.toThrow(
      UnverifiedGoogleEmailError,
    );
    expect(userRepository.storedUsers).toHaveLength(0);
  });
});
