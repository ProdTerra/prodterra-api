# ProdTerra API

NestJS API behind ProdTerra, the crop rotation planner for farmers built for the NASA Space Apps Challenge 2026 ("Field Shift"). It reads NASA elevation and climate data for a lot, serves the crop and pest catalog, evaluates the farmer's rotation against the climate and recommends one, and keeps optional accounts with saved farms.

The web app lives in a separate repository: `prodterra-web`.

## Endpoints

| Endpoint | What it does |
|---|---|
| `GET /terrain/elevation?longitude&latitude` | NASADEM elevation of a point (Microsoft Planetary Computer). |
| `POST /lots/climate-profile` | Lot elevation (mean, minimum, maximum) and NASA POWER monthly climatology adjusted to that elevation. |
| `GET /catalog/families`, `/catalog/crops`, `/catalog/pests`, `/catalog/crops/:cropKey/pests` | Catalog. Crops include `referenceCycleInDays`, the default duration the farmer sees. |
| `POST /plans/evaluate` | Farmer rotation per lot (start date, previous use, irrigation, crop and rest blocks) scheduled and assessed month by month (frost, temperature, irrigation, drought, pests), rotation warnings and a recommended rotation over the same horizon. |
| `POST /plans` | Earlier single-crop planner, kept for compatibility. |
| `/auth/*` | Accounts and sessions, see below. |
| `GET/POST /farms`, `GET/PUT/DELETE /farms/:farmId` | Saved farms of the logged-in user (others get 404). Error codes: `nameRequired`, `nameTooLong`, `invalidSnapshot`, `invalidLotCount`, `farmNotFound`. |

## Accounts and sessions

Logging in is optional: the planner works without an account, and an account is only needed to save farms and plans.

| Endpoint | Body | Success | Errors |
|---|---|---|---|
| `POST /auth/register` | `{ name, email, password }` | 201 `{ user }` and session cookie | 400 field errors, 409 `emailTaken` |
| `POST /auth/login` | `{ email, password }` | 200 `{ user }` and session cookie | 400 field errors, 401 `invalidCredentials` |
| `POST /auth/logout` | none | 204, session deleted and cookie cleared | |
| `GET /auth/me` | none | 200 `{ user }` with `avatarKey` | 401 `notAuthenticated` |
| `PATCH /auth/me` | `{ avatarKey }` (`farmer-01` to `farmer-10`) | 200 `{ user }` | 400 `invalidAvatar`, 401 `notAuthenticated` |
| `POST /auth/password/forgot` | `{ email, locale? }` | 204 always; when the account exists, emails a single-use link valid for 1 hour | 400 field errors |
| `POST /auth/password/reset` | `{ token, password, locale? }` | 200 `{ user }` and session cookie; ends every other session and emails a notice | 400 field errors, 400 `invalidResetLink` |
| `GET /auth/google?returnTo&locale` | none | 302 to Google (state and PKCE kept in a 10-minute httpOnly cookie) | |
| `GET /auth/google/callback` | none | 302 to `WEB_APP_URL` + `returnTo` with the session cookie | 302 with `?authError=googleUnavailable`, `googleCancelled` or `googleFailed` |

Registration and the first Google sign in send a welcome email. Google only signs in verified emails; an account with the same email is linked to Google. Accounts created with Google have no password until the farmer sets one through "forgot password". `locale` is `es` (default) or `en` and picks the email language.

`user` is `{ id, name, email }`; the password hash is never returned. Errors use one shape so the web can show them next to each field: `{ "errors": [{ "field": "email", "code": "invalidEmail" }] }`. Field codes: `nameRequired`, `nameTooLong` (80 characters), `invalidEmail`, `passwordRequired`, `passwordTooShort` (8 characters), `passwordTooLong` (128 characters). Register and login allow 10 requests per minute per IP and then answer 429 `tooManyAttempts`.

- Passwords are hashed with argon2id. Emails are trimmed and stored in lowercase, unique per account.
- The session token (32 random bytes) travels only in the `prodterra_session` cookie: httpOnly, SameSite=Lax, Path=/, Secure when `NODE_ENV=production`, 30 days. MongoDB stores only its SHA-256 hash, with a TTL index that removes expired sessions.
- The web must call the API with credentials (`fetch(url, { credentials: 'include' })`); CORS allows credentials only for the origins in `WEB_ORIGIN`.
- `SESSION_COOKIE_DOMAIN` (optional, empty by default) sets the cookie `Domain`, for example when the web and the API live on sibling subdomains.
- Other modules protect routes with `@UseGuards(SessionGuard)` and read the user with `@CurrentUser()`, both exported by `AccountsModule`.

## Run locally

Requirements: Node.js 22 or newer and a MongoDB Atlas cluster.

```bash
npm install
cp .env.example .env      # then fill MONGODB_URI
npm run start:dev         # http://localhost:4000
```

### Environment

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | Atlas connection string, without a database path. Required. |
| `DB_NAME` | Database inside the cluster, for example `development` locally and `production` on Render. Required. |
| `PORT` | Defaults to 4000. |
| `WEB_ORIGIN` | Web origins allowed by CORS (with credentials), comma separated. |
| `SESSION_COOKIE_DOMAIN` | Optional cookie domain. Leave empty when the web and the API share a site such as `app.prodterra.earth` and `api.prodterra.earth`. |
| `NODE_ENV` | Set to `production` on the server so the session cookie is `Secure`. |
| `WEB_APP_URL` | Web app address for email links and the return after Google sign in. Defaults to `http://localhost:3000`; `https://app.prodterra.earth` on Render. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | OAuth web client from Google Cloud Console. Without them the Google button returns `googleUnavailable`. |
| `GOOGLE_CALLBACK_URL` | Must match an authorized redirect URI of the client: `http://localhost:4000/auth/google/callback` locally, `https://api.prodterra.earth/auth/google/callback` on Render. |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | Gmail account and app password that send account emails. Without them emails are printed in the API log. |

### Database scripts

| Command | What it does |
|---|---|
| `npm run db:seed` | Loads the 7 families and 10 project crops with verified fields only. |
| `npm run db:seed:demo` | Loads approximate ranges and 18 pests for development. Refuses databases whose name does not end in `dev`, `development`, `test` or `demo`. |
| `npm run db:clean -- --confirm` | Deletes the catalog collections. |
| `npm run db:reset` | Clean and seed. |

### Tests and checks

| Command | What it does |
|---|---|
| `npx vitest run` | Unit tests. |
| `npm run test:e2e` | Endpoint tests with in-memory repositories (no database). |
| `npx tsc --noEmit` | TypeScript check. |
| `npm run lint` | oxlint. |

## Deployment (Render)

- Build command: `npm install && npm run build`. Start command: `npm run start:prod` (`nest start` runs out of memory on 512 MB).
- Environment: `MONGODB_URI`, `DB_NAME=production`, `WEB_ORIGIN=https://app.prodterra.earth`, `NODE_ENV=production`.
- The app trusts the first proxy so login throttling counts real client addresses.

## Code layout

Each module under `src` follows the same layers: `domain` (pure rules and repository ports), `application` (services), `infrastructure` (Mongo, NASA and Planetary Computer adapters) and `presentation` (controllers). Modules: `terrain`, `climate`, `catalog`, `planning`, `accounts`, `farms`.
