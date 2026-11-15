import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AccountService } from '../application/account.service.js';
import { SessionService } from '../application/session.service.js';
import { DuplicateEmailError, InvalidCredentialsError } from '../domain/accountErrors.js';
import {
  validateLogin,
  validateRegistration,
  type LoginInput,
  type RegistrationInput,
  type ValidationResult,
} from '../domain/credentialsValidation.js';
import type { User } from '../domain/user.js';
import { emailTakenException, invalidCredentialsException, invalidFieldsException } from './authErrors.js';
import { AuthenticationThrottlerGuard } from './authenticationThrottling.js';
import { CurrentUser } from './currentUser.js';
import { clearSessionCookie, readSessionToken, SessionCookieSettings, writeSessionCookie } from './sessionCookie.js';
import { SessionGuard } from './sessionGuard.js';
import { toUserResponse, type UserResponse } from './userResponse.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly accountService: AccountService,
    private readonly sessionService: SessionService,
    private readonly sessionCookieSettings: SessionCookieSettings,
  ) {}

  @Post('register')
  @UseGuards(AuthenticationThrottlerGuard)
  async register(
    @Body() body: Record<string, unknown>,
    @Res({ passthrough: true }) response: Response,
  ): Promise<UserResponse> {
    const input = requireValidInput(validateRegistration(body));
    const user = await this.registerOrReject(input);
    await this.startSession(user, response);
    return toUserResponse(user);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticationThrottlerGuard)
  async login(
    @Body() body: Record<string, unknown>,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<UserResponse> {
    const input = requireValidInput(validateLogin(body));
    const user = await this.authenticateOrReject(input);
    await this.sessionService.end(readSessionToken(request));
    await this.startSession(user, response);
    return toUserResponse(user);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<void> {
    await this.sessionService.end(readSessionToken(request));
    clearSessionCookie(response, this.sessionCookieSettings);
  }

  @Get('me')
  @UseGuards(SessionGuard)
  findCurrentUser(@CurrentUser() user: User): UserResponse {
    return toUserResponse(user);
  }

  private async registerOrReject(input: RegistrationInput): Promise<User> {
    try {
      return await this.accountService.register(input);
    } catch (error) {
      throw error instanceof DuplicateEmailError ? emailTakenException() : error;
    }
  }

  private async authenticateOrReject(input: LoginInput): Promise<User> {
    try {
      return await this.accountService.authenticate(input);
    } catch (error) {
      throw error instanceof InvalidCredentialsError ? invalidCredentialsException() : error;
    }
  }

  private async startSession(user: User, response: Response): Promise<void> {
    const { token } = await this.sessionService.start(user.id, new Date());
    writeSessionCookie(response, token, this.sessionCookieSettings);
  }
}

function requireValidInput<Input>(result: ValidationResult<Input>): Input {
  if (!result.isValid) {
    throw invalidFieldsException(result.errors);
  }
  return result.input;
}
