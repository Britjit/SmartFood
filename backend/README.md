# Smartfood — backend

Node + Express API that pulls real data for the frontend.

## Run it
```bash
cp .env.example .env   # then fill in values (Kroger keys are optional)
npm install
npm run dev            # http://localhost:3001
npm test               # offline tests with fake API responses
```

## Data sources
| Endpoint | Source | Key needed? |
|---|---|---|
| `GET /api/geocode?zip=` | OpenStreetMap Nominatim | No |
| `GET /api/places?lat=&lon=&miles=` | USDA SNAP Retailer Locator + OpenStreetMap Overpass (merged, deduped) | No |
| `GET /api/food-access?lat=&lon=` | USDA ERS Food Access Research Atlas (2019, census tract) | No |
| `GET /api/deals?zip=` | Kroger Public API: live sale prices on healthy staples at the nearest Kroger-family store | Yes (free) |
| `GET /api/fastfood` | Hand-curated healthier picks/swaps (`src/services/fastfood.js`) | No |
| `GET /api/health` | Server status + whether Kroger is configured | No |

Responses are cached in memory so we stay within the free services' rate limits.

## Kroger keys (for the deals tab)
1. Create an account at https://developer.kroger.com
2. Register an app (production environment) with the **Products** and **Locations** APIs
3. Put the client ID and secret in `.env` as `KROGER_CLIENT_ID` and `KROGER_CLIENT_SECRET`
4. Restart the server

Without keys everything else still works; the deals tab just shows a setup message.
Kroger only covers its own store family (Kroger, Ralphs, Fry's, King Soopers, Harris Teeter, Smith's, Fred Meyer, etc.), so some zip codes won't have a store nearby.

## Layout
- `src/app.js` – routes
- `src/services/` – one file per data source
- `src/lib/` – fetch helper + cache
