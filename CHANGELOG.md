# Changelog

## Unreleased

### Added
- `GET /catalog/crops` returns `referenceCycleInDays`, the single crop cycle the farmer sees as the default duration.

### Changed
- The demo seed keeps the official MAG/SEPSA cycles and only fills the crops without a source (lettuce 75 days, chayote 150 days).
- Planning uses the same reference cycle as the catalog.

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
