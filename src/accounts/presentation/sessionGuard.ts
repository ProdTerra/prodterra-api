import { Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { SessionService } from '../application/session.service.js';
import { notAuthenticatedException } from './authErrors.js';
import type { AuthenticatedRequest } from './currentUser.js';
import { readSessionToken } from './sessionCookie.js';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = await this.sessionService.findUser(readSessionToken(request), new Date());
    if (!user) {
      throw notAuthenticatedException();
    }
    request.currentUser = user;
    return true;
  }
}
