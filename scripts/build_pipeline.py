#!/usr/bin/env python3
"""
CAL Location & Revenue Dashboard - data pipeline.

Reads the raw Freshsales deal export and emits four JSON files the Next.js
dashboard renders. Every metric is split National vs Cafe Lines so the pipeline
filter (National / Cafe Lines / Both) is a client-side toggle over one dataset.

Locked business rules implemented here (do not change without sign-off):
  1. In scope = Won-family stages only, at real dollar value.
  2. Show Close Date = End date, fallback to Installation Date. Drives year/month.
  3. Cafe Lines = Account name contains a CL operator token; everything else National.
  4. Exclude BTB Boxes, Chicago Local Event, Streamline Events (by Tradeshow name).
  5. Espresso consolidation: Latte / Latte+ / Cappuccino / Caramel Macchiato = one Espresso Service.
  6. Stations are not multipliers (we count a service once per deal, never multiply).
  7. Add Ons and Modifiers are excluded from the service vocabulary.
  8. Pattern classification requires 3+ years of history, else "Insufficient Data for Pattern".
  9. Client-confirmed acronym -> full name disambiguations are locked (see DISAMBIGUATION).

Window: 2022-01-01 through 2026-07-07 (approved).

Usage:
  python3 build_pipeline.py <deals.csv> <out_dir> [base_services.json]
"""
import csv, json, re, sys, os
from collections import defaultdict, Counter
from datetime import date

DEALS = sys.argv[1] if len(sys.argv) > 1 else "Deals_July_7.csv"
OUT   = sys.argv[2] if len(sys.argv) > 2 else "data"
VOCAB = sys.argv[3] if len(sys.argv) > 3 else "base_services.json"
os.makedirs(OUT, exist_ok=True)

# ---------------------------------------------------------------- locked config
WON_STAGES = {"Won", "Shipped", "Partial Shipment", "Won: Show Cancelled", "Won / Production"}
CL_TOKENS  = ["OVG", "SODEXO", "LEVY", "CENTERPLATE", "SAVOR", "ARAMARK", "CAFE LINE"]
EXCLUDE_SHOWS = {"BTB BOXES", "CHICAGO LOCAL EVENT", "CHICAGO LOCAL EVENTS", "STREAMLINE EVENTS"}
WINDOW_START = date(2022, 1, 1)
WINDOW_END   = date(2026, 7, 7)
YEARS = [2022, 2023, 2024, 2025, 2026]

# Espresso variants that consolidate into one "Espresso Service" (rule 5).
ESPRESSO_TOKENS = ["espresso", "latte", "cappuccino", "caramel macchiato", "macchiato"]

# Client-confirmed acronym -> parent full name (rule 9). These override the
# free-text Organization Event Name where FS is inconsistent.
DISAMBIGUATION = {
    "ACR": "American College of Rheumatology",
    "ACC": "American College of Cardiology",
    "ATS": "American Thoracic Society",
    "ASN": "American Society of Nephrology",
    "AAO": "American Academy of Ophthalmology",
    "APA": "American Psychiatric Association",
    "CCC": "Crohn's & Colitis Congress",
    "PME": "Pri-Med East",
    "PMS": "Pri-Med South",
    "PMSW": "Pri-Med Southwest",
    "PMMW": "Pri-Med Midwest",
    "ACOG": "American College of Obstetricians and Gynecologists",
}

MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

# City-name normalization: fold FS typos and format variants so a Fixed-City
# show is not misread as rotating. Only unambiguous cases are mapped; ambiguous
# state-level entries (Colorado, Texas) are left as-is.
CITY_NORMALIZE = {
    "WASHINGON DC": "Washington DC", "WASHINGTON D.C.": "Washington DC",
    "WASHINGTON, DC": "Washington DC", "WASHINGTON DC": "Washington DC",
    "NASHVILLE, TN": "Nashville", "NEW YORK CITY": "New York",
    "ST LOUIS": "St. Louis", "SAN JUAN, PUERTO RICO": "San Juan",
    "LOS ANEGLES": "Los Angeles", "PHONEIX": "Phoenix", "ALRINGTON": "Arlington",
    "RHODE ISLAND": "Providence",
}
def norm_city(c):
    c = (c or "").strip()
    return CITY_NORMALIZE.get(c.upper(), c) if c else "Unknown"

# service-mix vocabulary (rule 7: drop add-on / branding / modifier items)
def load_vocab():
    try:
        raw = json.load(open(VOCAB))
    except Exception:
        return []
    drop = ("custom graphic", "custom cup", "custom color", "sprinkle", "modifier", "add on")
    return [v for v in raw if not any(d in v.lower() for d in drop)]

SERVICE_VOCAB = load_vocab()

# ---------------------------------------------------------------- helpers
def parse_date(s):
    m = re.match(r"(\d{4})-(\d{2})-(\d{2})", (s or "").strip())
    return date(int(m[1]), int(m[2]), int(m[3])) if m else None

def is_cafelines(account):
    a = (account or "").upper()
    return any(tok in a for tok in CL_TOKENS)

def canon_acr(a):
    # Canonical acronym key: uppercase, collapse any run of non-alphanumerics
    # to a single space. Merges "AACN/NTI", "AACN / NTI", "AACN NTI" into one.
    return re.sub(r"[^A-Z0-9]+", " ", (a or "").upper()).strip() or "UNSPECIFIED"

def has_espresso(desc):
    d = (desc or "").lower()
    return any(tok in d for tok in ESPRESSO_TOKENS)

def match_services(desc):
    """Approximate service mix: base-service names found in the free-text
    description. Counted once per deal (rule 6). Espresso variants collapse to
    one 'Espresso Service'. This is a keyword match and is approximate."""
    d = (desc or "").lower()
    found = set()
    if has_espresso(d):
        found.add("Espresso Service")
    for name in SERVICE_VOCAB:
        key = name.lower()
        if len(key) >= 4 and key in d:
            found.add(name)
    return found

# ---------------------------------------------------------------- read + scope
with open(DEALS, encoding="utf-8", errors="replace") as fh:
    rows = list(csv.reader(fh))
H = rows[0]
col = {name: i for i, name in enumerate(H)}
def g(r, name): return r[col[name]] if col.get(name) is not None and col[name] < len(r) else ""

deals = []
for r in rows[1:]:
    if g(r, "Deal stage") not in WON_STAGES:
        continue
    acr_raw = g(r, "Tradeshow name").strip()
    if acr_raw.upper() in EXCLUDE_SHOWS:
        continue
    d = parse_date(g(r, "End date")) or parse_date(g(r, "Installation Date"))
    if not d or not (WINDOW_START <= d <= WINDOW_END):
        continue
    try:
        value = float(g(r, "Deal Value"))
    except ValueError:
        value = 0.0
    if not acr_raw:
        acr_raw = "(Unspecified)"
    deals.append({
        # canonical key merges formatting variants of the same acronym
        # (e.g. "AACN/NTI" and "AACN / NTI") so routes stay unique.
        "acr": canon_acr(acr_raw),
        "acrRaw": acr_raw,
        "org": g(r, "Organization Event Name").strip(),
        "pipeline": "Cafe Lines" if is_cafelines(g(r, "Account name")) else "National",
        "year": d.year,
        "month": MONTHS[d.month - 1],
        "city": norm_city(g(r, "Show City")),
        "value": value,
        "espresso": has_espresso(g(r, "Service Description / Custom Info")),
        "services": match_services(g(r, "Service Description / Custom Info")),
    })

# ---------------------------------------------------------------- helpers for split
def pipe_key(p): return "national" if p == "National" else "cafeLines"
def blank_split(): return {"national": 0.0, "cafeLines": 0.0}

# ---------------------------------------------------------------- per-show build
by_show = defaultdict(list)
for d in deals:
    by_show[d["acr"]].append(d)

def full_name(acr, ds):
    if acr in DISAMBIGUATION:
        return DISAMBIGUATION[acr]
    orgs = Counter(d["org"] for d in ds if d["org"] and d["org"].upper() != acr)
    return orgs.most_common(1)[0][0] if orgs else (ds[0]["acrRaw"])

def modal(seq):
    c = Counter(seq)
    return c.most_common(1)[0][0] if c else None

def classify_city(city_by_year):
    """city_by_year: {year: city}. Returns (class, anchorCity, anchorCount, label)."""
    years = sorted(city_by_year)
    cities = [city_by_year[y] for y in years]
    if len(years) < 3:
        return ("Insufficient Data", None, None, "Insufficient Data for Pattern")
    counts = Counter(cities)
    distinct = len(counts)
    if distinct == 1:
        c = cities[0]
        return ("Fixed City", c, len(cities), f"Fixed City: {c}")
    if distinct == len(cities):
        return ("Full Rotation", None, None, "Full Rotation")
    anchor, n = counts.most_common(1)[0]
    return ("Rotation with Anchor", anchor, n, f"Rotation with Anchor: {anchor} ({n}x)")

def classify_month(month_by_year):
    years = sorted(month_by_year)
    months = [month_by_year[y] for y in years]
    uniq = list(dict.fromkeys(months))
    if len(years) < 3:
        return ("Insufficient Data", False, uniq, "Insufficient Data for Pattern")
    if len(uniq) == 1:
        return ("Fixed Month", False, uniq, f"Fixed Month: {uniq[0]}")
    label = "Month Drift: " + " -> ".join(uniq)
    cls = "Slight Drift" if len(uniq) == 2 else "Significant Drift"
    return (cls, True, uniq, label)

shows = []
for acr, ds in by_show.items():
    years_present = sorted({d["year"] for d in ds})
    # modal city/month per year (pattern is about where the SHOW lands, pipeline-independent)
    city_by_year = {y: modal([d["city"] for d in ds if d["year"] == y]) for y in years_present}
    month_by_year = {y: modal([d["month"] for d in ds if d["year"] == y]) for y in years_present}
    ccls, anchor, anchorN, clabel = classify_city(city_by_year)
    mcls, drift, months, mlabel = classify_month(month_by_year)

    def totals_for(pipe):
        dd = [d for d in ds if d["pipeline"] == pipe]
        rev = sum(d["value"] for d in dd)
        esp = sum(d["value"] for d in dd if d["espresso"])
        return {"revenue": round(rev, 2), "deals": len(dd),
                "espressoSharePct": round(esp / rev * 100, 1) if rev else 0.0}

    by_year = {}
    for y in years_present:
        entry = {}
        for pipe in ("National", "Cafe Lines"):
            dd = [d for d in ds if d["year"] == y and d["pipeline"] == pipe]
            if not dd:
                continue
            svc = Counter()
            for d in dd:
                for s in d["services"]:
                    svc[s] += 1
            entry[pipe_key(pipe)] = {
                "city": modal([d["city"] for d in dd]),
                "month": modal([d["month"] for d in dd]),
                "revenue": round(sum(d["value"] for d in dd), 2),
                "deals": len(dd),
                "services": dict(svc.most_common()),
            }
        if entry:
            by_year[str(y)] = entry

    # display acronym = most common raw formatting seen; slug from canonical key
    display = "(Unspecified)" if acr == "UNSPECIFIED" else Counter(d["acrRaw"] for d in ds).most_common(1)[0][0]
    shows.append({
        "key": acr,  # internal canonical join key; removed before writing JSON
        "acronym": display,
        "fullName": full_name(acr, ds),
        "slug": re.sub(r"[^a-z0-9]+", "-", acr.lower()).strip("-") or "unspecified",
        "pipelines": sorted({d["pipeline"] for d in ds}),
        "cityPattern": {"class": ccls, "anchorCity": anchor, "anchorCount": anchorN, "label": clabel},
        "monthPattern": {"class": mcls, "monthDrift": drift, "months": months, "label": mlabel},
        "years": years_present,
        "totals": {"national": totals_for("National"), "cafeLines": totals_for("Cafe Lines")},
        "byYear": by_year,
    })

shows.sort(key=lambda s: s["totals"]["national"]["revenue"] + s["totals"]["cafeLines"]["revenue"], reverse=True)

# ---------------------------------------------------------------- cities build
by_city = defaultdict(list)
for d in deals:
    by_city[d["city"]].append(d)

show_lookup = {s["key"]: s for s in shows}
cities = []
for city, ds in by_city.items():
    def tot(pipe):
        dd = [d for d in ds if d["pipeline"] == pipe]
        return {"revenue": round(sum(d["value"] for d in dd), 2), "deals": len(dd)}
    by_year = {}
    for y in YEARS:
        yd = [d for d in ds if d["year"] == y]
        if yd:
            by_year[str(y)] = {
                "national": {"revenue": round(sum(d["value"] for d in yd if d["pipeline"] == "National"), 2),
                             "deals": sum(1 for d in yd if d["pipeline"] == "National")},
                "cafeLines": {"revenue": round(sum(d["value"] for d in yd if d["pipeline"] == "Cafe Lines"), 2),
                              "deals": sum(1 for d in yd if d["pipeline"] == "Cafe Lines")},
            }
    acrs = sorted({d["acr"] for d in ds})
    show_rows = []
    for a in acrs:
        s = show_lookup.get(a)
        if not s:
            continue
        dd = [d for d in ds if d["acr"] == a]
        show_rows.append({
            "acronym": s["acronym"], "fullName": s["fullName"],
            "cityPatternLabel": s["cityPattern"]["label"],
            "yearsHere": sorted({d["year"] for d in dd}),
            "revenue": {"national": round(sum(d["value"] for d in dd if d["pipeline"] == "National"), 2),
                        "cafeLines": round(sum(d["value"] for d in dd if d["pipeline"] == "Cafe Lines"), 2)},
        })
    show_rows.sort(key=lambda x: x["revenue"]["national"] + x["revenue"]["cafeLines"], reverse=True)
    cities.append({
        "city": city,
        "slug": re.sub(r"[^a-z0-9]+", "-", city.lower()).strip("-") or "unknown",
        "totals": {"national": tot("National"), "cafeLines": tot("Cafe Lines")},
        "byYear": by_year,
        "distinctShows": len(show_rows),
        "shows": show_rows,
    })
cities.sort(key=lambda c: c["totals"]["national"]["revenue"] + c["totals"]["cafeLines"]["revenue"], reverse=True)

# ---------------------------------------------------------------- patterns build
def rev_split(acr_set):
    r = {"national": 0.0, "cafeLines": 0.0}
    for d in deals:
        if d["acr"] in acr_set:
            r[pipe_key(d["pipeline"])] += d["value"]
    return {k: round(v, 2) for k, v in r.items()}

CITY_CLASS_DESC = {
    "Fixed City": "Same host city 3+ years. A revenue trend here is a demand or menu signal, not a location one.",
    "Rotation with Anchor": "Rotates but returns to one anchor city across the cycle.",
    "Full Rotation": "Different city every year. Revenue is heavily shaped by which city they land in.",
    "Insufficient Data": "Fewer than 3 years of history. Not enough to classify a pattern.",
}
patterns = []
for cls in ["Fixed City", "Rotation with Anchor", "Full Rotation", "Insufficient Data"]:
    members = [s for s in shows if s["cityPattern"]["class"] == cls]
    patterns.append({
        "key": cls, "kind": "cityClass", "description": CITY_CLASS_DESC[cls],
        "showCount": len(members),
        "revenue": rev_split({s["key"] for s in members}),
        "showAcronyms": [s["acronym"] for s in members],
    })
drift_members = [s for s in shows if s["monthPattern"]["monthDrift"]]
patterns.append({
    "key": "Month Drift", "kind": "overlay",
    "description": "Month moves year to year, so YoY revenue can look like it wobbles when demand is steady. Overlaps the city classes; not additive to grand revenue.",
    "showCount": len(drift_members),
    "revenue": rev_split({s["key"] for s in drift_members}),
    "showAcronyms": [s["acronym"] for s in drift_members],
})

# ---------------------------------------------------------------- meta build
def sum_pipe(pipe):
    dd = [d for d in deals if d["pipeline"] == pipe]
    return {"deals": len(dd), "revenue": round(sum(d["value"] for d in dd), 2)}
grand = round(sum(d["value"] for d in deals), 2)
esp_nat = sum(d["value"] for d in deals if d["pipeline"] == "National" and d["espresso"])
esp_cl  = sum(d["value"] for d in deals if d["pipeline"] == "Cafe Lines" and d["espresso"])
nat = sum_pipe("National"); cl = sum_pipe("Cafe Lines")
meta = {
    "title": "CAL Location & Revenue Dashboard",
    "client": "Crêpes à Latte",
    "dateRange": {"start": "2022-01-01", "end": "2026-07-07", "label": "2022 to July 7 2026"},
    "generatedAt": date.today().isoformat(),
    "sourceFiles": ["Deals_July_7.csv", "cm_tradeshow_edition_fsids_20260709.csv",
                    "cm_tradeshow_fsids_20260709.csv", "CAL_Service_List_v10.xlsx"],
    "pipelines": ["National", "Cafe Lines"],
    "defaultPipeline": "National",
    "years": YEARS,
    "yearLabels": {"2026": "2026 YTD"},
    "totals": {"dealsInScope": len(deals), "byPipeline": {"national": nat, "cafeLines": cl},
               "grandRevenue": grand, "uniqueShows": len(shows), "distinctCities": len(cities)},
    "patternClasses": ["Fixed City", "Rotation with Anchor", "Full Rotation", "Insufficient Data"],
    "patternFilters": ["Fixed City", "Rotation with Anchor", "Full Rotation", "Month Drift", "Insufficient Data"],
    "espresso": {
        "definition": "A deal counts as espresso if its service description includes a consolidated Espresso Service (Latte / Latte+ / Cappuccino / Caramel Macchiato). Revenue is not split within multi-service deals.",
        "byPipeline": {"national": {"sharePct": round(esp_nat / nat["revenue"] * 100, 1) if nat["revenue"] else 0.0},
                       "cafeLines": {"sharePct": round(esp_cl / cl["revenue"] * 100, 1) if cl["revenue"] else 0.0}},
    },
    "serviceMixNote": "Service mix is derived by keyword match against the v10 base-service vocabulary from the free-text Service Description field. It is approximate; Add Ons and Modifiers are excluded.",
    "rules": {
        "wonStages": sorted(WON_STAGES), "closeDate": "End date, fallback Installation Date",
        "cafeLinesTokens": CL_TOKENS, "excludedShows": sorted(EXCLUDE_SHOWS), "patternMinYears": 3,
    },
    "branding": {"purple": "#944197", "bodyFont": "Karla", "headerFont": "Bricolage Grotesque"},
}

# ---------------------------------------------------------------- write + verify
for s in shows:
    s.pop("key", None)  # internal join key, not part of the public schema

def dump(name, obj):
    json.dump(obj, open(os.path.join(OUT, name), "w"), indent=2, ensure_ascii=False)
dump("meta.json", meta); dump("shows.json", shows); dump("cities.json", cities); dump("patterns.json", patterns)

show_rev = sum(s["totals"]["national"]["revenue"] + s["totals"]["cafeLines"]["revenue"] for s in shows)
city_rev = sum(c["totals"]["national"]["revenue"] + c["totals"]["cafeLines"]["revenue"] for c in cities)
cityclass_rev = sum(p["revenue"]["national"] + p["revenue"]["cafeLines"] for p in patterns if p["kind"] == "cityClass")
print(f"deals in scope : {len(deals)}")
print(f"grand revenue  : ${grand:,.2f}")
print(f"  National     : {nat['deals']} / ${nat['revenue']:,.2f}")
print(f"  Cafe Lines   : {cl['deals']} / ${cl['revenue']:,.2f}")
print(f"shows={len(shows)}  cities={len(cities)}")
print(f"reconcile shows sum   : ${show_rev:,.2f}  (diff ${grand-show_rev:,.2f})")
print(f"reconcile cities sum  : ${city_rev:,.2f}  (diff ${grand-city_rev:,.2f})")
print(f"reconcile city-classes: ${cityclass_rev:,.2f}  (diff ${grand-cityclass_rev:,.2f})")
for p in patterns:
    print(f"  {p['key']:<22} {p['showCount']:>3} shows  ${p['revenue']['national']+p['revenue']['cafeLines']:>13,.0f}  [{p['kind']}]")
