# Architecture

## Modules

| Module | Responsibility |
|---|---|
| `terrain` | Elevation of a point or lot from NASADEM. |
| `climate` | NASA POWER monthly climatology, adjusted to the lot elevation. |
| `catalog` | Families, crops, pests and diseases. |
| `planning` | Evaluation of the farmer's rotation and the recommended rotation. |
| `accounts` | Registration, sessions, Google sign in, password reset and emails. |
| `farms` | Saved farms of each user. |

## Layers

Every module follows the same layers (hexagonal architecture):

| Layer | Contents |
|---|---|
| `domain` | Pure rules and ports (abstract classes for repositories and providers). |
| `application` | Services that use the domain. |
| `infrastructure` | Adapters: MongoDB, NASA POWER, Planetary Computer, Gmail, Google OAuth. |
| `presentation` | Controllers and response mapping. |

Tests replace the ports with in-memory fakes, so they need no database or network.

## External services

| Service | Used for |
|---|---|
| NASA POWER | Monthly climatology per point. |
| Microsoft Planetary Computer | NASADEM elevation. |
| MongoDB Atlas | Catalog, accounts, sessions and saved farms. |
| Google OAuth | Optional sign in. |
| Gmail SMTP | Account emails. |

Climate and elevation responses are cached in memory to avoid repeated calls.
