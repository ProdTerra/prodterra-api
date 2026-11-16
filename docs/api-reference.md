# API reference

All responses are JSON. Field errors share one shape, so the web can show each message next to its field:

```json
{ "errors": [{ "field": "email", "code": "invalidEmail" }] }
```

## Terrain and climate

| Endpoint | Description |
|---|---|
| `GET /terrain/elevation?longitude&latitude` | NASADEM elevation of a point. |
| `POST /lots/climate-profile` | Elevation of a lot (mean, minimum, maximum) and its 12 months of NASA POWER climate, adjusted to that elevation. |

## Catalog

| Endpoint | Description |
|---|---|
| `GET /catalog/families` | Plant families. |
| `GET /catalog/crops` | Crops with their ranges and `referenceCycleInDays`, the default duration shown to the farmer. |
| `GET /catalog/pests` | Pests and diseases. `type` is `disease` or `pest`. |
| `GET /catalog/crops/:cropKey/pests` | Pests and diseases of one crop's family. |

When a name has no English translation, `name.en` repeats the Spanish name.

## Planning

| Endpoint | Description |
|---|---|
| `POST /plans/evaluate` | Evaluates the farmer's rotation and returns a recommended one. |
| `POST /plans` | Earlier single-crop planner, kept for compatibility. |

`POST /plans/evaluate` takes a start date and, for each lot, its boundary, previous use, irrigation and up to 100 blocks (crop or rest) of 1 to 3650 days.

It answers, for each lot:

- The lot elevation and its 12 months of climate.
- The farmer's plan, month by month, with a status (`ok`, `watch` or `risk`) and its alerts.
- Rotation warnings: `sameFamilyInARow`, `shorterThanReference`, `altitudeOutOfRange`.
- A recommended plan over the same period, with the reasons for each choice.

How alerts and recommendations are decided is explained in [Planning rules](planning-rules.md).

## Accounts

See [Accounts and sessions](accounts.md) for the `/auth/*` endpoints.

## Saved farms

These endpoints require a session. A farm that belongs to another user answers 404.

| Endpoint | Description |
|---|---|
| `GET /farms` | Farms of the current user. |
| `POST /farms` | Saves a farm with its lots and plan. |
| `GET /farms/:farmId` | One farm. |
| `PUT /farms/:farmId` | Replaces a farm. |
| `DELETE /farms/:farmId` | Deletes a farm. |

Error codes: `nameRequired`, `nameTooLong`, `nameTaken` (409, same name ignoring case, accents and extra spaces), `invalidSnapshot`, `invalidLotCount`, `farmNotFound`.
