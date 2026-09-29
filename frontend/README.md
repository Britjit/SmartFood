# Smartfood — frontend

React + Vite. Map uses Leaflet + OpenStreetMap tiles. Data comes from the backend (`../backend`).

## Run it
Start the backend first (see `../backend/README.md`), then:
```bash
npm install
npm run dev
```
Open http://localhost:5173. Vite forwards `/api` requests to the backend on port 3001.

## Where things live
- `src/App.jsx` – layout, tabs, loads places + food-access data
- `src/components/` – LocationBar, FoodMap, Deals, FastFood
- `src/lib/api.js` – calls to the backend + map category colors
- `src/data/programs.js` – SNAP / WIC / Double Up Food Bucks links
- `src/index.css` – color theme (green background, white text)
