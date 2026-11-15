# Changelog

## Unreleased

### Added
- Farmer avatars: every account gets one of 10 farmer avatars (`avatarKey`, `farmer-01` to `farmer-10`) at registration or first Google sign in, returned by the auth endpoints; `PATCH /auth/me` with `{ avatarKey }` changes it (400 `invalidAvatar` for unknown keys).
- Sign in and registration with Google (`GET /auth/google`, `GET /auth/google/callback`) using the authorization code flow with state and PKCE; accounts with the same verified email are linked.
- Password reset by email (`POST /auth/password/forgot`, `POST /auth/password/reset`) with single-use links valid for 1 hour, stored only as SHA-256 hashes; a reset ends every session.
- Account emails through Gmail SMTP: welcome, password reset link and password changed notice, in Spanish or English.
- `POST /farms` and `PUT /farms/:farmId` return 409 `nameTaken` when the user already has a farm with the same name (ignoring case, accents and extra spaces).
- Water alerts use the crop's water need range: below the minimum gives `irrigation` or `drought`, and above the maximum gives the new `waterExcess` alert (watch). Before, both used the midpoint.
- `POST /plans/evaluate`: takes the farmer's rotation per lot (start date, previous use, irrigation, crop and rest blocks) and returns it scheduled and assessed month by month with NASA climate, rotation warnings (`sameFamilyInARow`, `shorterThanReference`, `altitudeOutOfRange`) and a recommended rotation over the same horizon.
- Saved farms per user: `GET /farms`, `POST /farms`, `GET /farms/:farmId`, `PUT /farms/:farmId`, `DELETE /farms/:farmId`, only for the logged-in owner, with field error codes (`nameRequired`, `nameTooLong`, `invalidSnapshot`, `invalidLotCount`).
- `GET /catalog/crops` returns `referenceCycleInDays`, the single crop cycle the farmer sees as the default duration.
- Accounts: `POST /auth/register`, `POST /auth/login`, `POST /auth/logout` and `GET /auth/me`, with argon2id passwords, a 30-day httpOnly `prodterra_session` cookie (only its SHA-256 hash is stored), field-specific error codes and 10 requests per minute per IP on register and login.
- `SESSION_COOKIE_DOMAIN` (optional) sets the session cookie domain.

### Changed
- `POST /plans/evaluate` no longer limits a lot plan to 730 days in total: a lot accepts up to 100 blocks of 1 to 730 days each.
- `POST /plans/evaluate` accepts blocks from 1 day (was 14), so short rests such as 3 days can be planned.
- Crops no longer have a latitude range (`latitudeInDegrees`); nothing used it.
- The demo seed keeps the official MAG/SEPSA cycles and only fills the crops without a source (lettuce 75 days, chayote 150 days).
- Planning uses the same reference cycle as the catalog.
- CORS allows credentials for the configured `WEB_ORIGIN` origins.

## 0.1.0 - 2026-11-14

### Added
- `GET /terrain/elevation`: NASADEM elevation for a point, read from Microsoft Planetary Computer.
- `POST /lots/climate-profile`: lot elevation (NASADEM mean, minimum, maximum) and monthly NASA POWER climatology 2001-2025, with temperatures corrected to the lot elevation at -6.5 °C per 1000 m.
- Catalog in MongoDB Atlas: plant families, crops and pests, with `GET /catalog/families`, `/catalog/crops`, `/catalog/pests` and `/catalog/crops/:cropKey/pests` (pests derived from the crop family).
- `npm run seed:catalog` loads the five families and six focus crops for Cartago with verified fields only.
- Several web origins allowed for CORS through `WEB_ORIGIN` (comma separated).

### Configuration
- `MONGODB_URI` (required): MongoDB Atlas connection string.
- `PORT` (default 4000) and `WEB_ORIGIN` (default `http://localhost:3000`).
