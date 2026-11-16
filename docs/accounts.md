# Accounts and sessions

An account is optional. The planner works without one; an account is only needed to save farms.

## Endpoints

| Endpoint | Body | Success | Errors |
|---|---|---|---|
| `POST /auth/register` | `{ name, email, password }` | 201 `{ user }` and session cookie | 400 field errors, 409 `emailTaken` |
| `POST /auth/login` | `{ email, password }` | 200 `{ user }` and session cookie | 400 field errors, 401 `invalidCredentials` |
| `POST /auth/logout` | none | 204, session deleted | |
| `GET /auth/me` | none | 200 `{ user }` | 401 `notAuthenticated` |
| `PATCH /auth/me` | `{ name?, avatarKey? }` | 200 `{ user }` | 400 `nameRequired`, `nameTooLong`, `invalidAvatar`, `nothingToUpdate`; 401 `notAuthenticated` |
| `POST /auth/password/forgot` | `{ email, locale? }` | 204 always; emails a link when the account exists | 400 field errors |
| `POST /auth/password/reset` | `{ token, password, locale? }` | 200 `{ user }` and session cookie | 400 field errors, 400 `invalidResetLink` |
| `GET /auth/google?returnTo&locale` | none | 302 to Google | |
| `GET /auth/google/callback` | none | 302 back to the web app with the session cookie | 302 with `?authError=googleUnavailable`, `googleCancelled` or `googleFailed` |

`user` is `{ id, name, email, avatarKey }`. The password hash is never returned. `avatarKey` is `farmer-01` to `farmer-10`. `locale` is `es` (default) or `en` and sets the email language.

Field error codes: `nameRequired`, `nameTooLong` (80 characters), `invalidEmail`, `passwordRequired`, `passwordTooShort` (8 characters), `passwordTooLong` (128 characters).

Register and login allow 10 requests per minute per IP, then answer 429 `tooManyAttempts`.

## Security

- Passwords are hashed with argon2id.
- Emails are trimmed, stored in lowercase and unique per account.
- The session token (32 random bytes) travels only in the `prodterra_session` cookie: httpOnly, SameSite=Lax, 30 days, `Secure` in production. The database stores only its SHA-256 hash, and expired sessions are removed automatically.
- Password reset links work once and expire after 1 hour. Only their SHA-256 hash is stored. A reset ends every other session.
- The web must call the API with credentials (`credentials: 'include'`). CORS accepts credentials only from the origins in `WEB_ORIGIN`.

## Google sign in

- Uses the authorization code flow with state and PKCE, kept in a 10-minute httpOnly cookie.
- Only verified Google emails are accepted. An existing account with the same email is linked to Google.
- An account created with Google has no password until the farmer sets one through "forgot password".

## Emails

Sent through Gmail SMTP, in Spanish or English:

- Welcome, after registration or the first Google sign in.
- Password reset link.
- Password changed notice.

Without Gmail credentials, emails are written to the log instead.

## Using sessions in other modules

`AccountsModule` exports `SessionGuard` and the `@CurrentUser()` decorator. Protect a route with `@UseGuards(SessionGuard)` and read the user with `@CurrentUser()`.
