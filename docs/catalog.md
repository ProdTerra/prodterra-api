# Catalog

The catalog holds plant families, crops, and pests and diseases. It is stored in MongoDB and loaded with seed scripts.

## Real catalog

`npm run db:seed` loads the team spreadsheet "base de datos productos agro": 8 families, 12 crops and 44 pests and diseases, each with its sources.

Crops: potato, onion, tomato, eggplant, cilantro, sweet pepper, lowland avocado, cassava, sugarcane, cabbage, coffee and maize.

Each crop has:

| Field | Meaning |
|---|---|
| Altitude range | Meters above sea level where it grows. |
| Temperature range | °C, compared with the month's mean temperature. |
| Water need | Millimeters per whole cycle. |
| Humidity range | Relative humidity, %. |
| Main nutrient | N, P or K. |
| Cycle length | Days from sowing to harvest. |
| Family | Used for rotation and pests. |

A pest or disease has a type (`disease` or `pest`) and the families it attacks. It has no climate ranges of its own: it becomes an alarm when its crop is outside its own ranges. See [Planning rules](planning-rules.md).

Rules followed when loading the spreadsheet:

- No data is invented. Values the spreadsheet does not have stay empty (for example sunlight and nutrient level).
- English names were translated by the team.
- Tomato uses a minimum of 18 °C, a team decision.
- The eggplant disease and pest columns were swapped, as confirmed by the team.

## Demo catalog

`npm run db:seed:demo` loads fictitious data for development: 7 families, 10 crops and 18 pests. It refuses to run on a database whose name does not end in `dev`, `development`, `test` or `demo`. While demo data is loaded, evaluations answer `usesDemoData: true` and the web shows a notice.
