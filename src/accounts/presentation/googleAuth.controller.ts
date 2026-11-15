import { Controller, Get, Logger, Query, Req, Res } from '@nestjs/common';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { Request, Response } from 'express';
import { AccountService } from '../application/account.service.js';
import { SessionService } from '../application/session.service.js';
import { WebAppSettings } from '../application/webAppSettings.js';
import { GoogleIdentityProvider } from '../domain/googleIdentityProvider.js';
import { readLocale } from '../domain/locale.js';
import { clearGoogleSignInCookie, readGoogleSignInCookie, writeGoogleSignInCookie } from './googleSignInCookie.js';
import { safeReturnPath } from './returnPath.js';
import { readSessionToken, SessionCookieSettings, writeSessionCookie } from './sessionCookie.js';

type GoogleSignInError = 'googleUnavailable' | 'googleFailed' | 'googleCancelled';

function randomToken(): string {
  return randomBytes(32).toString('base64url');
}

function codeChallengeOf(codeVerifier: string): string {
  return createHash('sha256').update(codeVerifier).digest('base64url');
}

function isSameState(expected: string, received: unknown): boolean {
  if (typeof received !== 'string' || received.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

@Controller('auth/google')
export class GoogleAuthController {
  private readonly logger = new Logger(GoogleAuthController.name);

  constructor(
    private readonly googleIdentityProvider: GoogleIdentityProvider,
    private readonly accountService: AccountService,
    private readonly sessionService: SessionService,
    private readonly sessionCookieSettings: SessionCookieSettings,
    private readonly webAppSettings: WebAppSettings,
  ) {}

  @Get()
  start(@Query('returnTo') returnTo: unknown, @Query('locale') locale: unknown, @Res() response: Response): void {
    const returnPath = safeReturnPath(returnTo);
    if (!this.googleIdentityProvider.isConfigured()) {
      this.redirectWithError(response, returnPath, 'googleUnavailable');
      return;
    }
    const attempt = { state: randomToken(), codeVerifier: randomToken(), returnPath, locale: readLocale(locale) };
    writeGoogleSignInCookie(response, attempt, this.sessionCookieSettings);
    response.redirect(
      this.googleIdentityProvider.authorizationUrl({ state: attempt.state, codeChallenge: codeChallengeOf(attempt.codeVerifier) }),
    );
  }

  @Get('callback')
  async finish(
    @Query('code') code: unknown,
    @Query('state') state: unknown,
    @Query('error') error: unknown,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const attempt = readGoogleSignInCookie(request);
    clearGoogleSignInCookie(response, this.sessionCookieSettings);
    if (!attempt || !isSameState(attempt.state, state)) {
      this.redirectWithError(response, attempt?.returnPath ?? '/', 'googleFailed');
      return;
    }
    if (typeof error === 'string' || typeof code !== 'string') {
      this.redirectWithError(response, attempt.returnPath, 'googleCancelled');
      return;
    }
    try {
      const profile = await this.googleIdentityProvider.profileFromCode(code, attempt.codeVerifier);
      const user = await this.accountService.signInWithGoogle(profile, attempt.locale);
      await this.sessionService.end(readSessionToken(request));
      const { token } = await this.sessionService.start(user.id, new Date());
      writeSessionCookie(response, token, this.sessionCookieSettings);
      response.redirect(this.webAppSettings.link(attempt.returnPath));
    } catch (signInError) {
      this.logger.warn(`Google sign in failed: ${signInError instanceof Error ? signInError.message : String(signInError)}`);
      this.redirectWithError(response, attempt.returnPath, 'googleFailed');
    }
  }

  private redirectWithError(response: Response, returnPath: string, authError: GoogleSignInError): void {
    const url = new URL(this.webAppSettings.link(returnPath));
    url.searchParams.set('authError', authError);
    response.redirect(url.toString());
  }
}
