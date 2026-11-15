import type { ConfigService } from '@nestjs/config';
import { parseCookie } from 'cookie';
import type { CookieOptions, Request, Response } from 'express';
import { sessionLifetimeInMilliseconds } from '../domain/session.js';

export const sessionCookieName = 'prodterra_session';

export class SessionCookieSettings {
  constructor(
    readonly secure: boolean,
    readonly domain: string | undefined,
  ) {}
}

export function createSessionCookieSettings(configService: ConfigService): SessionCookieSettings {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const domain = configService.get<string>('SESSION_COOKIE_DOMAIN') || undefined;
  return new SessionCookieSettings(isProduction, domain);
}

export function writeSessionCookie(response: Response, token: string, settings: SessionCookieSettings): void {
  response.cookie(sessionCookieName, token, { ...baseCookieOptions(settings), maxAge: sessionLifetimeInMilliseconds });
}

export function clearSessionCookie(response: Response, settings: SessionCookieSettings): void {
  response.clearCookie(sessionCookieName, baseCookieOptions(settings));
}

export function readSessionToken(request: Request): string | undefined {
  const cookieHeader = request.headers.cookie;
  return cookieHeader ? parseCookie(cookieHeader)[sessionCookieName] : undefined;
}

function baseCookieOptions(settings: SessionCookieSettings): CookieOptions {
  return { httpOnly: true, sameSite: 'lax', path: '/', secure: settings.secure, domain: settings.domain };
}
