import { Injectable } from '@nestjs/common';
import { DuplicateEmailError, InvalidCredentialsError, UnverifiedGoogleEmailError } from '../domain/accountErrors.js';
import { normalizeEmail, type LoginInput, type RegistrationInput } from '../domain/credentialsValidation.js';
import type { GoogleProfile } from '../domain/googleIdentityProvider.js';
import type { Locale } from '../domain/locale.js';
import { PasswordHasher } from '../domain/passwordHasher.js';
import { withoutPasswordHash, type User } from '../domain/user.js';
import { UserRepository } from '../domain/userRepository.js';
import { AccountMailer } from './accountMailer.js';

const nameMaximumLength = 80;

@Injectable()
export class AccountService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly accountMailer: AccountMailer,
  ) {}

  async register(input: RegistrationInput, locale: Locale): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new DuplicateEmailError();
    }
    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = await this.userRepository.create({ name: input.name, email: input.email, passwordHash, googleId: null });
    await this.accountMailer.sendWelcome(user, locale);
    return user;
  }

  async authenticate(input: LoginInput): Promise<User> {
    const storedUser = await this.userRepository.findByEmail(input.email);
    if (!storedUser?.passwordHash) {
      await this.passwordHasher.verifyAgainstDummyHash(input.password);
      throw new InvalidCredentialsError();
    }
    const isPasswordCorrect = await this.passwordHasher.verify(storedUser.passwordHash, input.password);
    if (!isPasswordCorrect) {
      throw new InvalidCredentialsError();
    }
    return withoutPasswordHash(storedUser);
  }

  async signInWithGoogle(profile: GoogleProfile, locale: Locale): Promise<User> {
    if (!profile.isEmailVerified) {
      throw new UnverifiedGoogleEmailError();
    }
    const linkedUser = await this.userRepository.findByGoogleId(profile.googleId);
    if (linkedUser) {
      return withoutPasswordHash(linkedUser);
    }
    const email = normalizeEmail(profile.email);
    const userWithEmail = await this.userRepository.findByEmail(email);
    if (userWithEmail) {
      await this.userRepository.linkGoogleAccount(userWithEmail.id, profile.googleId);
      return withoutPasswordHash(userWithEmail);
    }
    const name = (profile.name.trim() || email.split('@')[0]).slice(0, nameMaximumLength);
    const user = await this.userRepository.create({ name, email, passwordHash: null, googleId: profile.googleId });
    await this.accountMailer.sendWelcome(user, locale);
    return user;
  }
}
