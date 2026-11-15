import { InMemoryUserRepository } from '../../../test/support/inMemoryAccountRepositories.js';
import { InvalidCredentialsError } from '../domain/accountErrors.js';
import { Argon2PasswordHasher } from '../infrastructure/argon2PasswordHasher.js';
import { AccountService } from './account.service.js';

const registration = { name: 'Ana Solano', email: 'ana@example.com', password: 'cartago-2026' };

function createAccountService() {
  const userRepository = new InMemoryUserRepository();
  const passwordHasher = new Argon2PasswordHasher();
  return { userRepository, passwordHasher, accountService: new AccountService(userRepository, passwordHasher) };
}

describe('AccountService', () => {
  it('stores an argon2id hash and never the plain password', async () => {
    const { userRepository, accountService } = createAccountService();
    const user = await accountService.register(registration);
    const storedUser = userRepository.storedUsers[0];
    expect(storedUser.passwordHash).not.toContain(registration.password);
    expect(storedUser.passwordHash.startsWith('$argon2id$')).toBe(true);
    expect(user).not.toHaveProperty('passwordHash');
  });

  it('rejects a wrong password and an unknown email with the same error', async () => {
    const { passwordHasher, accountService } = createAccountService();
    await accountService.register(registration);
    const dummyVerification = vi.spyOn(passwordHasher, 'verifyAgainstDummyHash');

    await expect(accountService.authenticate({ email: registration.email, password: 'wrong-password' })).rejects.toThrow(
      InvalidCredentialsError,
    );
    await expect(accountService.authenticate({ email: 'nobody@example.com', password: 'whatever-1' })).rejects.toThrow(
      InvalidCredentialsError,
    );
    expect(dummyVerification).toHaveBeenCalledTimes(1);
  });
});
