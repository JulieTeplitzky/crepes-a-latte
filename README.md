# Crêpes à Latte — Location & Revenue Dashboard

Next.js (App Router) + Tailwind + Recharts. Prepared by 11 Zebras for Crêpes à Latte.

Answers: how does where CAL shows land (city rotation) relate to revenue,
National vs Cafe Lines. Every figure ties back to the 4.5-year deal analysis
(2022 to July 7 2026).

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build

```bash
npm run build && npm start
```

## Data

The four JSON files in `public/data/` are the entire dataset. They are read at
build time (static generation).

- `meta.json` — scope totals, definitions, espresso split, branding tokens
- `patterns.json` — the four city-rotation buckets, revenue split by pipeline
- `shows.json` — one record per show: rotation, revenue, espresso, year-by-year
- `cities.json` — one record per city: revenue by pipeline and year

To refresh, re-run the generator against the analysis workbook and commit:

```bash
python3 scripts/build_json.py "path/to/CAL Services and Location Analysis.xlsx" public/data
```

All summary views total to grand revenue ($60,134,412). Pattern buckets match
the workbook's Pattern Findings tab. The "One-Off / Custom" bucket holds shows
with under 3 years of history plus any acronym not classified, so the four
buckets still sum to all revenue.

## Deploy

Push to the `crepes-a-latte` GitHub repo; Vercel auto-deploys. No env vars.

## Routes

- `/` overview: pattern-vs-revenue, espresso, cities, searchable shows table
- `/show/[acronym]` per-show drill-down: city rotation and revenue year over year
- `/city/[city]` per-city drill-down: revenue by year and shows that land there
