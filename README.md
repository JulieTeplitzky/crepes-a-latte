# Crêpes à Latte — Location & Revenue Dashboard

Next.js (App Router) + Tailwind + Recharts. A strategic analytical tool showing how
where CAL shows land (city rotation) relates to revenue, National vs Cafe Lines.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## How it works

The whole dashboard runs off four static JSON files in `public/data/`, read at
build time. There is no live API in this MVP (Phase 2).

- `meta.json` — scope totals, definitions, espresso split, branding, locked rules
- `shows.json` — one record per show: rotation pattern (with city inline), month
  drift, revenue and service mix by year, all split National vs Cafe Lines
- `cities.json` — one record per city: revenue by year and the shows that land there
- `patterns.json` — the four city-rotation classes plus the Month Drift overlay

Every number is stored as a `{ national, cafeLines }` pair, so the National /
Cafe Lines / Both toggle in the header is a pure client-side switch over one
dataset (National is the default). See `app/components/PipelineContext.js`.

## Refreshing the data

Re-run the pipeline against the deal export and commit the new JSON. Vercel
auto-deploys on push.

```bash
python3 scripts/build_pipeline.py Deals_July_7.csv public/data scripts/base_services.json
```

The pipeline (`scripts/build_pipeline.py`) implements the locked business rules
(Won-family stages, End-date/Installation close date, 2022 to July 7 2026 window,
Cafe Lines by account token, BTB/Chicago Local/Streamline exclusions, espresso
consolidation, 3+ year pattern classification, confirmed acronym disambiguations).
City-name normalization and those rules are constants near the top of the file.

## Routes

- `/` overview: revenue by year by host city, pattern strip, searchable shows table
- `/show/[slug]` rotation history, month drift, service mix over time
- `/city/[slug]` National vs Cafe Lines side by side, shows that land there
- `/patterns` pattern browser, filterable (Month Drift included)

## Notes

- Service mix is approximate (keyword match from the free-text description).
  Espresso consolidation is exact per the locked rule.
- Desktop-first. Mobile is usable but not the priority.
- Phase 2: material handling / floor plans (square footage over time), booth-size
  vs product-launch correlation, pharma differentiation, live FS API.
