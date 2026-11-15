import { Injectable } from '@nestjs/common';
import { DuplicateEmailError, InvalidCredentialsError } from '../domain/accountErrors.js';
import type { LoginInput, RegistrationInput } from '../domain/credentialsValidation.js';
import { PasswordHasher } from '../domain/passwordHasher.js';
import { withoutPasswordHash, type User } from '../domain/user.js';
import { UserRepository } from '../domain/userRepository.js';

@Injectable()
export class AccountService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async register(input: RegistrationInput): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new DuplicateEmailError();
    }
    const passwordHash = await this.passwordHasher.hash(input.password);
    return this.userRepository.create({ name: input.name, email: input.email, passwordHash });
  }

  async authenticate(input: LoginInput): Promise<User> {
    const storedUser = await this.userRepository.findByEmail(input.email);
    if (!storedUser) {
      await this.passwordHasher.verifyAgainstDummyHash(input.password);
      throw new InvalidCredentialsError();
    }
    const isPasswordCorrect = await this.passwordHasher.verify(storedUser.passwordHash, input.password);
    if (!isPasswordCorrect) {
      throw new InvalidCredentialsError();
    }
    return withoutPasswordHash(storedUser);
  }
}
