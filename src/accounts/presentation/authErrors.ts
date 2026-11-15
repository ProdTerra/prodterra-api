import { BadRequestException, ConflictException, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import type { FieldError, ProfileFieldError } from '../domain/credentialsValidation.js';

export function invalidFieldsException(errors: FieldError[]): BadRequestException {
  return new BadRequestException({ errors });
}

export function emailTakenException(): ConflictException {
  return new ConflictException({ errors: [{ field: 'email', code: 'emailTaken' }] });
}

export function invalidCredentialsException(): UnauthorizedException {
  return new UnauthorizedException({ errors: [{ code: 'invalidCredentials' }] });
}

export function notAuthenticatedException(): UnauthorizedException {
  return new UnauthorizedException({ errors: [{ code: 'notAuthenticated' }] });
}

export function tooManyAttemptsException(): HttpException {
  return new HttpException({ errors: [{ code: 'tooManyAttempts' }] }, HttpStatus.TOO_MANY_REQUESTS);
}

export function invalidResetLinkException(): BadRequestException {
  return new BadRequestException({ errors: [{ code: 'invalidResetLink' }] });
}

export function invalidProfileException(errors: ProfileFieldError[]): BadRequestException {
  return new BadRequestException({ errors });
}
