"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usePipeline } from "./PipelineContext";
import { sel, usd0, pct, CLASS_COLOR } from "../lib/format";

// Row-interactive shows table. Filter chips are a first-class pattern dimension
// (Month Drift included as an overlay). Revenue/espresso columns follow the
// active pipeline. Clicking a row opens the show detail.
const FILTERS = ["All", "Fixed City", "Rotation with Anchor", "Full Rotation", "Month Drift", "Insufficient Data"];

export default function ShowsTable({ shows, initialFilter = "All" }) {
  const { mode } = usePipeline();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState(initialFilter);
  const [sort, setSort] = useState({ key: "revenue", dir: "desc" });

  const rows = useMemo(() => {
    let r = shows.filter((s) => s.acronym !== "(Unspecified)");
    if (filter === "Month Drift") r = r.filter((s) => s.monthPattern.monthDrift);
    else if (filter !== "All") r = r.filter((s) => s.cityPattern.class === filter);
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      r = r.filter((s) => s.acronym.toLowerCase().includes(t) || (s.fullName || "").toLowerCase().includes(t));
    }
    const val = (s) =>
      sort.key === "revenue" ? sel(s.totals, mode, "revenue")
      : sort.key === "deals" ? sel(s.totals, mode, "deals")
      : sort.key === "espresso" ? espresso(s, mode) : 0;
    return [...r].sort((a, b) => (sort.dir === "desc" ? val(b) - val(a) : val(a) - val(b)));
  }, [shows, q, filter, sort, mode]);

  const th = (label, key, right) => (
    <th
      onClick={key ? () => setSort((s) => ({ key, dir: s.key === key && s.dir === "desc" ? "asc" : "desc" })) : undefined}
      className={`font-body text-xs uppercase tracking-wide text-muted py-2 px-3 ${right ? "text-right" : "text-left"} ${key ? "cursor-pointer select-none hover:text-purple" : ""}`}>
      {label}{sort.key === key ? (sort.dir === "desc" ? " ▾" : " ▴") : ""}
    </th>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search show..."
          className="font-body text-sm border border-line rounded-lg px-3 py-1.5 w-48 focus:outline-none focus:border-purple" />
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((c) => (
            <button key={c} onClick={() => setFilter(c)}
              className="font-body text-xs rounded-full px-3 py-1 border transition-colors"
              style={filter === c
                ? { background: c === "All" ? "#111014" : CLASS_COLOR[c] || "#944197", color: "#fff", borderColor: "transparent" }
                : { background: "#fff", color: "#6b6570", borderColor: "#e5dfe7" }}>
              {c}
            </button>
          ))}
        </div>
        <span className="font-body text-xs text-muted ml-auto">{rows.length} shows · {mode}</span>
      </div>

      <div className="border border-line rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-mist">
            <tr>
              {th("Show", "")}{th("Pattern", "")}{th("City", "")}
              {th("Revenue", "revenue", true)}{th("Espresso", "espresso", true)}{th("Deals", "deals", true)}
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.slug} className="row-link border-t border-line hover:bg-mist"
                onClick={() => router.push(`/show/${s.slug}`)}>
                <td className="py-2 px-3">
                  <span className="font-body font-semibold text-ink">{s.acronym}</span>
                  {s.fullName && s.fullName !== s.acronym
                    ? <span className="font-body text-muted text-xs ml-2">{s.fullName}</span> : null}
                </td>
                <td className="py-2 px-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-body" style={{ color: CLASS_COLOR[s.cityPattern.class] }}>
                    <span className="inline-block w-2 h-2 rounded-full" style={{ background: CLASS_COLOR[s.cityPattern.class] }} />
                    {s.cityPattern.label}
                    {s.monthPattern.monthDrift ? <span className="text-drift">· drifts</span> : null}
                  </span>
                </td>
                <td className="py-2 px-3 font-body text-sm text-muted">{s.cityPattern.anchorCity || anchorHint(s)}</td>
                <td className="py-2 px-3 text-right font-body tabular-nums">{usd0(sel(s.totals, mode, "revenue"))}</td>
                <td className="py-2 px-3 text-right font-body tabular-nums text-purple">{pct(espresso(s, mode))}</td>
                <td className="py-2 px-3 text-right font-body tabular-nums text-muted">{sel(s.totals, mode, "deals")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function espresso(s, mode) {
  const n = s.totals.national, c = s.totals.cafeLines;
  if (mode === "National") return n.espressoSharePct;
  if (mode === "Cafe Lines") return c.espressoSharePct;
  const rev = n.revenue + c.revenue;
  if (!rev) return 0;
  return Math.round(((n.revenue * n.espressoSharePct + c.revenue * c.espressoSharePct) / rev) * 10) / 10;
}
function anchorHint(s) {
  // Full Rotation has no anchor; show "rotates" as the city hint.
  return s.cityPattern.class === "Full Rotation" ? "rotates" : "-";
}
