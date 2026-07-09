"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usd0, pct, CLASS_COLOR } from "../lib/format";

const CLASSES = [
  "All",
  "Fixed City",
  "Rotation with Anchor",
  "Full Rotation",
  "One-Off / Custom",
];

export default function ShowsTable({ shows }) {
  const [q, setQ] = useState("");
  const [cls, setCls] = useState("All");
  const [sort, setSort] = useState({ key: "totalRevenue", dir: "desc" });

  const rows = useMemo(() => {
    let r = shows.filter((s) => s.acronym !== "(Unspecified)");
    if (cls !== "All") r = r.filter((s) => s.cityPatternClass === cls);
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      r = r.filter(
        (s) =>
          s.acronym.toLowerCase().includes(t) ||
          (s.fullName || "").toLowerCase().includes(t)
      );
    }
    const { key, dir } = sort;
    const val = (s) =>
      key === "espresso" ? s.espressoSplit.espressoSharePct : s[key];
    r = [...r].sort((a, b) =>
      dir === "desc" ? val(b) - val(a) : val(a) - val(b)
    );
    return r;
  }, [shows, q, cls, sort]);

  const th = (label, key, right) => (
    <th
      onClick={key ? () => setSort((s) => ({ key, dir: s.key === key && s.dir === "desc" ? "asc" : "desc" })) : undefined}
      className={`font-body text-xs uppercase tracking-wide text-muted py-2 px-3 ${
        right ? "text-right" : "text-left"
      } ${key ? "cursor-pointer select-none hover:text-purple" : ""}`}
    >
      {label}
      {sort.key === key ? (sort.dir === "desc" ? " ▾" : " ▴") : ""}
    </th>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search show..."
          className="font-body text-sm border border-line rounded-lg px-3 py-1.5 w-48 focus:outline-none focus:border-purple"
        />
        <div className="flex flex-wrap gap-1.5">
          {CLASSES.map((c) => (
            <button
              key={c}
              onClick={() => setCls(c)}
              className="font-body text-xs rounded-full px-3 py-1 border transition-colors"
              style={
                cls === c
                  ? { background: c === "All" ? "#944197" : CLASS_COLOR[c] || "#944197", color: "#fff", borderColor: "transparent" }
                  : { background: "#fff", color: "#6b6570", borderColor: "#e5dfe7" }
              }
            >
              {c}
            </button>
          ))}
        </div>
        <span className="font-body text-xs text-muted ml-auto">
          {rows.length} shows
        </span>
      </div>

      <div className="border border-line rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-mist">
            <tr>
              {th("Show", "")}
              {th("Pattern", "")}
              {th("Pipelines", "")}
              {th("Total revenue", "totalRevenue", true)}
              {th("Espresso %", "espresso", true)}
              {th("Deals", "dealCount", true)}
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.acronym} className="border-t border-line hover:bg-mist">
                <td className="py-2 px-3">
                  <Link
                    href={`/show/${encodeURIComponent(s.acronym)}`}
                    className="font-body font-semibold text-ink hover:text-purple no-underline"
                  >
                    {s.acronym}
                  </Link>
                  {s.fullName && s.fullName !== s.acronym ? (
                    <span className="font-body text-muted text-xs ml-2">
                      {s.fullName}
                    </span>
                  ) : null}
                </td>
                <td className="py-2 px-3">
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-body"
                    style={{ color: CLASS_COLOR[s.cityPatternClass] }}
                  >
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{ background: CLASS_COLOR[s.cityPatternClass] }}
                    />
                    {s.cityPatternClass}
                    {s.monthDrift ? (
                      <span className="text-muted">- drifts</span>
                    ) : null}
                  </span>
                </td>
                <td className="py-2 px-3 font-body text-xs text-muted">
                  {s.pipelines.join(" + ")}
                </td>
                <td className="py-2 px-3 text-right font-body tabular-nums">
                  {usd0(s.totalRevenue)}
                </td>
                <td className="py-2 px-3 text-right font-body tabular-nums text-purple">
                  {pct(s.espressoSplit.espressoSharePct)}
                </td>
                <td className="py-2 px-3 text-right font-body tabular-nums text-muted">
                  {s.dealCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
