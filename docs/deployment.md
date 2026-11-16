# Deployment and releases

## Render

| Setting | Value |
|---|---|
| Build command | `npm install && npm run build` |
| Start command | `npm run start:prod` (`nest start` runs out of memory on 512 MB) |
| Environment | `MONGODB_URI`, `DB_NAME=production`, `WEB_ORIGIN=https://app.prodterra.earth`, `NODE_ENV=production`, `WEB_APP_URL=https://app.prodterra.earth`, `GOOGLE_CALLBACK_URL=https://api.prodterra.earth/auth/google/callback`, plus the Google and Gmail credentials |

The app trusts the first proxy, so login throttling counts the real client address.

On the free plan the service sleeps when idle, so the first request after a pause can take several seconds.

To load or update the catalog in production, run `npm run db:seed` with `DB_NAME=production`. Back up the catalog collections first.

## Branches

- `main`: what runs in production. Changes only through release pull requests.
- `develop`: integration branch. Every change arrives through a pull request from a `feature/*`, `fix/*` or `docs/*` branch.

Commits follow [Conventional Commits](https://www.conventionalcommits.org/) and are signed.

## Versions

[Semantic Versioning](https://semver.org/), still in `0.x`:

- A release with new features (`feat`) raises the minor version: `0.4.0` → `0.5.0`.
- A release with only fixes raises the patch version: `0.5.0` → `0.5.1`.
- A repository with no changes gets no release.

Changes are listed under `## Unreleased` in `CHANGELOG.md` as they are merged.

## Release steps

1. Create `release/X.Y.Z` from `develop`.
2. Set the version in `package.json` and rename `## Unreleased` to `## X.Y.Z - date` in `CHANGELOG.md`.
3. Open a pull request to `main` and merge it.
4. Tag `main` with a signed tag `vX.Y.Z` and publish a GitHub release with the changelog section.
5. Merge the release branch back into `develop`.
