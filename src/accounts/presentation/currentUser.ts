import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { User } from '../domain/user.js';

export type AuthenticatedRequest = Request & { currentUser?: User };

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User | undefined =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().currentUser,
);
