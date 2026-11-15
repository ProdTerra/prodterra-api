import { type INestApplication } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AccountService } from '../src/accounts/application/account.service.js';
import { SessionService } from '../src/accounts/application/session.service.js';
import { PasswordHasher } from '../src/accounts/domain/passwordHasher.js';
import { SessionRepository } from '../src/accounts/domain/sessionRepository.js';
import { UserRepository } from '../src/accounts/domain/userRepository.js';
import { Argon2PasswordHasher } from '../src/accounts/infrastructure/argon2PasswordHasher.js';
import { AuthController } from '../src/accounts/presentation/auth.controller.js';
import { authenticationThrottlerOptions } from '../src/accounts/presentation/authenticationThrottling.js';
import { SessionCookieSettings } from '../src/accounts/presentation/sessionCookie.js';
import { SessionGuard } from '../src/accounts/presentation/sessionGuard.js';
import { configureApplication } from '../src/configureApplication.js';
import { InMemorySessionRepository, InMemoryUserRepository } from './support/inMemoryAccountRepositories.js';

const registration = { name: '  Ana Solano ', email: ' Ana@Example.com ', password: 'cartago-2026' };

async function createAccountsApplication(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [ThrottlerModule.forRoot(authenticationThrottlerOptions)],
    controllers: [AuthController],
    providers: [
      AccountService,
      SessionService,
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
});
