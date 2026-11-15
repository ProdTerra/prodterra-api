import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, type ThrottlerModuleOptions } from '@nestjs/throttler';
import { tooManyAttemptsException } from './authErrors.js';

export const authenticationThrottlerOptions: ThrottlerModuleOptions = [
  { name: 'authentication', ttl: 60_000, limit: 10 },
];

@Injectable()
export class AuthenticationThrottlerGuard extends ThrottlerGuard {
  protected throwThrottlingException(): Promise<void> {
    return Promise.reject(tooManyAttemptsException());
  }
}
