import { parseCookie } from 'cookie';
import type { Request, Response } from 'express';
import { readLocale, type Locale } from '../domain/locale.js';
import { safeReturnPath } from './returnPath.js';
import type { SessionCookieSettings } from './sessionCookie.js';

const googleSignInCookieName = 'prodterra_google_sign_in';
const googleSignInCookiePath = '/auth/google';
const googleSignInLifetimeInMilliseconds = 10 * 60 * 1000;

export type GoogleSignInAttempt = { state: string; codeVerifier: string; returnPath: string; locale: Locale };

export function writeGoogleSignInCookie(response: Response, attempt: GoogleSignInAttempt, settings: SessionCookieSettings): void {
  response.cookie(googleSignInCookieName, Buffer.from(JSON.stringify(attempt)).toString('base64url'), {
    httpOnly: true,
    sameSite: 'lax',
    secure: settings.secure,
    path: googleSignInCookiePath,
    maxAge: googleSignInLifetimeInMilliseconds,
  });
}

export function clearGoogleSignInCookie(response: Response, settings: SessionCookieSettings): void {
  response.clearCookie(googleSignInCookieName, { httpOnly: true, sameSite: 'lax', secure: settings.secure, path: googleSignInCookiePath });
}

export function readGoogleSignInCookie(request: Request): GoogleSignInAttempt | null {
  const cookieHeader = request.headers.cookie;
  const value = cookieHeader ? parseCookie(cookieHeader)[googleSignInCookieName] : undefined;
  if (!value) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as Record<string, unknown>;
    if (typeof parsed.state !== 'string' || typeof parsed.codeVerifier !== 'string') {
      return null;
    }
    return {
      state: parsed.state,
      codeVerifier: parsed.codeVerifier,
      returnPath: safeReturnPath(parsed.returnPath),
      locale: readLocale(parsed.locale),
    };
  } catch {
    return null;
  }
}
