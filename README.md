# Smartfood

A web platform that helps people find healthy food in food deserts and low-income neighborhoods.

## Features
1. **Healthy food finder** – map of nearby grocery stores, farmers markets, and food banks, with SNAP/EBT acceptance from USDA data and a USDA food-desert check for your area.
2. **Deals** – live sale prices on healthy staples at nearby Kroger-family stores, plus links to SNAP, WIC, and Double Up Food Bucks.
3. **Fast food, made healthier** – better picks and easy swaps at the fast food chains closest to you.

## Run it locally
Two terminals:
```bash
# 1) backend
cd backend
cp .env.example .env
npm install
npm run dev

# 2) frontend
cd frontend
npm install
npm run dev
```
Open http://localhost:5173.

## Folder layout
- `frontend/` – React web app
- `backend/` – Express API that talks to USDA, OpenStreetMap, and Kroger
- `docs/` – notes, requirements, research
- `data/` – datasets
- `design/` – mockups, logos, wireframes

Built vibe-coding style to practice LLM tooling.
