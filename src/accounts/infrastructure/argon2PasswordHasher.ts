import { randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import argon2 from 'argon2';
import { PasswordHasher } from '../domain/passwordHasher.js';

@Injectable()
export class Argon2PasswordHasher extends PasswordHasher {
  private dummyHash: Promise<string> | undefined;

  hash(password: string): Promise<string> {
    return argon2.hash(password, { type: argon2.argon2id });
  }

  verify(passwordHash: string, password: string): Promise<boolean> {
    return argon2.verify(passwordHash, password);
  }

  async verifyAgainstDummyHash(password: string): Promise<void> {
    await this.verify(await this.getDummyHash(), password);
  }

  private getDummyHash(): Promise<string> {
    this.dummyHash ??= this.hash(randomBytes(32).toString('base64url'));
    return this.dummyHash;
  }
}
