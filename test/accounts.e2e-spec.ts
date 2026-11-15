import { type INestApplication } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AccountMailer } from '../src/accounts/application/accountMailer.js';
import { AccountService } from '../src/accounts/application/account.service.js';
import { PasswordResetService } from '../src/accounts/application/passwordReset.service.js';
import { WebAppSettings } from '../src/accounts/application/webAppSettings.js';
import { GoogleIdentityProvider, type GoogleProfile } from '../src/accounts/domain/googleIdentityProvider.js';
import { MailSender } from '../src/accounts/domain/mailSender.js';
import { PasswordResetRepository } from '../src/accounts/domain/passwordResetRepository.js';
import { SessionService } from '../src/accounts/application/session.service.js';
import { PasswordHasher } from '../src/accounts/domain/passwordHasher.js';
import { SessionRepository } from '../src/accounts/domain/sessionRepository.js';
import { UserRepository } from '../src/accounts/domain/userRepository.js';
import { Argon2PasswordHasher } from '../src/accounts/infrastructure/argon2PasswordHasher.js';
import { AuthController } from '../src/accounts/presentation/auth.controller.js';
import { GoogleAuthController } from '../src/accounts/presentation/googleAuth.controller.js';
import { authenticationThrottlerOptions } from '../src/accounts/presentation/authenticationThrottling.js';
import { SessionCookieSettings } from '../src/accounts/presentation/sessionCookie.js';
import { SessionGuard } from '../src/accounts/presentation/sessionGuard.js';
import { configureApplication } from '../src/configureApplication.js';
import {
  InMemoryPasswordResetRepository,
  InMemorySessionRepository,
  InMemoryUserRepository,
  RecordingMailSender,
} from './support/inMemoryAccountRepositories.js';

const registration = { name: '  Ana Solano ', email: ' Ana@Example.com ', password: 'cartago-2026' };

class FakeGoogleIdentityProvider extends GoogleIdentityProvider {
  profile: GoogleProfile = { googleId: 'google-1', email: 'luis@example.com', isEmailVerified: true, name: 'Luis Mora' };

  isConfigured(): boolean {
    return true;
  }

  authorizationUrl({ state, codeChallenge }: { state: string; codeChallenge: string }): string {
    return `https://accounts.google.test/auth?state=${state}&code_challenge=${codeChallenge}`;
  }

  async profileFromCode(code: string): Promise<GoogleProfile> {
    if (code !== 'valid-code') {
      throw new Error('bad code');
    }
    return this.profile;
  }
}

const mailSender = new RecordingMailSender();

async function createAccountsApplication(): Promise<INestApplication> {
  mailSender.sentMessages.length = 0;
  const moduleRef = await Test.createTestingModule({
    imports: [ThrottlerModule.forRoot(authenticationThrottlerOptions)],
    controllers: [AuthController, GoogleAuthController],
    providers: [
      AccountService,
      AccountMailer,
      PasswordResetService,
      SessionService,
      { provide: PasswordResetRepository, useValue: new InMemoryPasswordResetRepository() },
      { provide: MailSender, useValue: mailSender },
      { provide: GoogleIdentityProvider, useValue: new FakeGoogleIdentityProvider() },
      { provide: WebAppSettings, useValue: new WebAppSettings('http://localhost:3000') },
      SessionGuard,
      { provide: UserRepository, useValue: new InMemoryUserRepository() },
      { provide: SessionRepository, useValue: new InMemorySessionRepository() },
      { provide: PasswordHasher, useClass: Argon2PasswordHasher },
      { provide: SessionCookieSettings, useValue: new SessionCookieSettings(false, undefined) },
    ],
  }).compile();
  const app = moduleRef.createNestApplication();
  configureApplication(app);
  await app.init();
  return app;
}

function sessionCookieFrom(response: request.Response): string {
  const setCookie = response.headers['set-cookie'] as unknown as string[];
  return setCookie.find((cookie) => cookie.startsWith('prodterra_session='))!;
}

describe('auth endpoints', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createAccountsApplication();
  });

  afterEach(async () => {
    await app.close();
  });

  it('registers, reads the current user from the cookie and logs out', async () => {
    const registered = await request(app.getHttpServer()).post('/auth/register').send(registration);
    expect(registered.status).toBe(201);
    expect(registered.body).toEqual({ user: { id: expect.any(String), name: 'Ana Solano', email: 'ana@example.com' } });
    const cookie = sessionCookieFrom(registered);
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Lax/);
    expect(cookie).toMatch(/Path=\//);
    expect(cookie).toMatch(/Max-Age=2592000/);
    const sessionCookie = cookie.split(';')[0];

    const currentUser = await request(app.getHttpServer()).get('/auth/me').set('Cookie', sessionCookie);
    expect(currentUser.status).toBe(200);
    expect(currentUser.body).toEqual(registered.body);

    const loggedOut = await request(app.getHttpServer()).post('/auth/logout').set('Cookie', sessionCookie);
    expect(loggedOut.status).toBe(204);
    expect(sessionCookieFrom(loggedOut)).toMatch(/Expires=Thu, 01 Jan 1970/);

    const afterLogout = await request(app.getHttpServer()).get('/auth/me').set('Cookie', sessionCookie);
    expect(afterLogout.status).toBe(401);
  });

  it('answers 401 on /auth/me without a session cookie', async () => {
    const response = await request(app.getHttpServer()).get('/auth/me');
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ errors: [{ code: 'notAuthenticated' }] });
  });

  it('returns field-specific codes for invalid registration fields and a taken email', async () => {
    const invalid = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: ' ', email: 'not-an-email', password: 'short' });
    expect(invalid.status).toBe(400);
    expect(invalid.body).toEqual({
      errors: [
        { field: 'name', code: 'nameRequired' },
        { field: 'email', code: 'invalidEmail' },
        { field: 'password', code: 'passwordTooShort' },
      ],
    });

    await request(app.getHttpServer()).post('/auth/register').send(registration);
    const taken = await request(app.getHttpServer()).post('/auth/register').send(registration);
    expect(taken.status).toBe(409);
    expect(taken.body).toEqual({ errors: [{ field: 'email', code: 'emailTaken' }] });
  });

  it('gives the same 401 for a wrong password and an unknown email', async () => {
    await request(app.getHttpServer()).post('/auth/register').send(registration);
    const wrongPassword = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ana@example.com', password: 'wrong-password' });
    const unknownEmail = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password: 'wrong-password' });
    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body).toEqual({ errors: [{ code: 'invalidCredentials' }] });
    expect(unknownEmail.body).toEqual(wrongPassword.body);
  });

  it('throttles login after 10 attempts per minute', async () => {
    const credentials = { email: 'nobody@example.com', password: 'wrong-password' };
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await request(app.getHttpServer()).post('/auth/login').send(credentials);
    }
    const throttled = await request(app.getHttpServer()).post('/auth/login').send(credentials);
    expect(throttled.status).toBe(429);
    expect(throttled.body).toEqual({ errors: [{ code: 'tooManyAttempts' }] });
  });

  it('emails a reset link, sets the new password with it and signs the farmer in', async () => {
    const server = app.getHttpServer();
    await request(server).post('/auth/register').send(registration);
    const forgot = await request(server).post('/auth/password/forgot').send({ email: 'ana@example.com', locale: 'es' });
    expect(forgot.status).toBe(204);
    const link = mailSender.sentMessages.at(-1)!.text.match(/http:\/\/localhost:3000\/reset-password\?token=\S+/)![0];
    const token = new URL(link).searchParams.get('token');

    const reset = await request(server).post('/auth/password/reset').send({ token, password: 'nueva-clave-1', locale: 'es' });
    expect(reset.status).toBe(200);
    expect(reset.body.user.email).toBe('ana@example.com');
    const me = await request(server).get('/auth/me').set('Cookie', sessionCookieFrom(reset).split(';')[0]);
    expect(me.status).toBe(200);
    expect(mailSender.sentMessages.at(-1)!.subject).toBe('Tu contraseña de ProdTerra cambió');

    const login = await request(server).post('/auth/login').send({ email: 'ana@example.com', password: 'nueva-clave-1' });
    expect(login.status).toBe(200);
    const reused = await request(server).post('/auth/password/reset').send({ token, password: 'otra-clave-12' });
    expect(reused.status).toBe(400);
    expect(reused.body).toEqual({ errors: [{ code: 'invalidResetLink' }] });
  });

  it('answers the same for an unknown email and validates the reset fields', async () => {
    const server = app.getHttpServer();
    expect((await request(server).post('/auth/password/forgot').send({ email: 'nobody@example.com' })).status).toBe(204);
    expect(mailSender.sentMessages).toEqual([]);
    const invalidEmail = await request(server).post('/auth/password/forgot').send({ email: 'nope' });
    expect(invalidEmail.body).toEqual({ errors: [{ field: 'email', code: 'invalidEmail' }] });
    const shortPassword = await request(server).post('/auth/password/reset').send({ token: 'x', password: 'short' });
    expect(shortPassword.body).toEqual({ errors: [{ field: 'password', code: 'passwordTooShort' }] });
  });

  it('signs in with Google through state and PKCE and returns to the page the farmer was on', async () => {
    const server = app.getHttpServer();
    const started = await request(server).get('/auth/google').query({ returnTo: '/farms', locale: 'en' });
    expect(started.status).toBe(302);
    const googleUrl = new URL(started.headers.location);
    expect(googleUrl.searchParams.get('code_challenge')).toMatch(/^[A-Za-z0-9_-]{43}$/);
    const attemptCookie = (started.headers['set-cookie'] as unknown as string[])[0].split(';')[0];

    const finished = await request(server)
      .get('/auth/google/callback')
      .query({ code: 'valid-code', state: googleUrl.searchParams.get('state') })
      .set('Cookie', attemptCookie);
    expect(finished.status).toBe(302);
    expect(finished.headers.location).toBe('http://localhost:3000/farms');
    const me = await request(server).get('/auth/me').set('Cookie', sessionCookieFrom(finished).split(';')[0]);
    expect(me.body).toEqual({ user: { id: expect.any(String), name: 'Luis Mora', email: 'luis@example.com' } });
  });

  it('sends the farmer back with an error when the Google state does not match', async () => {
    const server = app.getHttpServer();
    const started = await request(server).get('/auth/google').query({ returnTo: 'https://evil.example' });
    const attemptCookie = (started.headers['set-cookie'] as unknown as string[])[0].split(';')[0];
    const finished = await request(server)
      .get('/auth/google/callback')
      .query({ code: 'valid-code', state: 'forged-state' })
      .set('Cookie', attemptCookie);
    expect(finished.headers.location).toBe('http://localhost:3000/?authError=googleFailed');
    expect(finished.headers['set-cookie']?.toString()).not.toContain('prodterra_session=');
  });
});
