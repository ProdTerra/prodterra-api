# Getting started

## Requirements

- Node.js 22 or newer.
- A MongoDB Atlas cluster. Use one database per environment, for example `development` locally and `production` on the server.

## Setup

```bash
npm install
cp .env.example .env
npm run db:seed
npm run start:dev
```

The API listens on `http://localhost:4000`. The web app expects it there by default.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | Yes | Atlas connection string, without a database path. |
| `DB_NAME` | Yes | Database inside the cluster, for example `development`. |
| `PORT` | No | Defaults to `4000`. |
| `WEB_ORIGIN` | No | Web origins allowed by CORS with credentials, comma separated. |
| `NODE_ENV` | No | `production` on the server, so the session cookie is `Secure`. |
| `SESSION_COOKIE_DOMAIN` | No | Cookie domain. Leave empty when the web and the API share a site, such as `app.prodterra.earth` and `api.prodterra.earth`. |
| `WEB_APP_URL` | No | Web app address used in email links and after Google sign in. Defaults to `http://localhost:3000`. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | No | Google OAuth web client. Without them, Google sign in answers `googleUnavailable`. |
| `GOOGLE_CALLBACK_URL` | No | Must match an authorized redirect URI of the client, for example `http://localhost:4000/auth/google/callback`. |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | No | Gmail account and app password for account emails. Without them, emails are printed in the log. |

## Scripts

| Command | What it does |
|---|---|
| `npm run start:dev` | Development server with reload. |
| `npm run build` | Compiles to `dist/`. |
| `npm run start:prod` | Runs the compiled build. |
| `npm run db:seed` | Loads the real catalog. See [Catalog](catalog.md). |
| `npm run db:seed:demo` | Loads fictitious demo data. Only works on databases named `*dev`, `*development`, `*test` or `*demo`. |
| `npm run db:clean -- --confirm` | Deletes the catalog collections. |
| `npm run db:reset` | Cleans and seeds the catalog. |

## Tests and checks

| Command | What it does |
|---|---|
| `npx vitest run` | Unit tests. |
| `npm run test:e2e` | Endpoint tests with in-memory repositories. No database needed. |
| `npx tsc --noEmit` | Type check. |
| `npm run lint` | Lint with oxlint. |
