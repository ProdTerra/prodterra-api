# ProdTerra API

Backend of **ProdTerra**, a crop rotation planner that helps small and medium farmers decide what to plant, in which lot and when, using NASA climate and elevation data.

ProdTerra was built by team ProdTerra for the [NASA Space Apps Challenge 2026](https://www.spaceappschallenge.org/2026/find-a-team/prodterra/), "Field Shift" challenge.

- Web app: [app.prodterra.earth](https://app.prodterra.earth) ([prodterra-web](https://github.com/ProdTerra/prodterra-web))
- API: [api.prodterra.earth](https://api.prodterra.earth)

## What it does

- Reads the elevation of each lot (NASADEM) and its typical monthly climate (NASA POWER), adjusted to that elevation.
- Serves the crop and pest catalog built by the team.
- Evaluates the farmer's rotation month by month and raises alarms: frost, temperature, drought, irrigation, excess water, pests and diseases.
- Recommends a rotation for each lot over the same period.
- Keeps optional accounts (email or Google) with saved farms.

## Tech stack

NestJS · TypeScript · MongoDB Atlas (Mongoose) · Vitest · deployed on Render.

## Quick start

Requires Node.js 22 or newer and a MongoDB Atlas cluster.

```bash
npm install
cp .env.example .env   # fill MONGODB_URI and DB_NAME
npm run db:seed        # load the catalog
npm run start:dev      # http://localhost:4000
```

## Documentation

| Document | Contents |
|---|---|
| [Getting started](docs/getting-started.md) | Setup, environment variables, scripts and tests. |
| [API reference](docs/api-reference.md) | Every endpoint with its input and output. |
| [Accounts and sessions](docs/accounts.md) | Sign in, Google, password reset, cookies and emails. |
| [Planning rules](docs/planning-rules.md) | How alarms are raised and how the recommended rotation is chosen. |
| [Catalog](docs/catalog.md) | Crop, family and pest data, its sources and the seed scripts. |
| [Architecture](docs/architecture.md) | Modules, layers and external services. |
| [Deployment and releases](docs/deployment.md) | Render setup, branches, versioning and release steps. |

## License

All rights reserved by team ProdTerra. No license is granted to reuse this code.
