import { createHash, randomBytes } from 'node:crypto';

const sessionTokenByteLength = 32;
const sessionTokenPattern = /^[A-Za-z0-9_-]{43}$/;

export function generateSessionToken(): string {
  return randomBytes(sessionTokenByteLength).toString('base64url');
}

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function isWellFormedSessionToken(token: string | undefined): token is string {
  return token !== undefined && sessionTokenPattern.test(token);
}
