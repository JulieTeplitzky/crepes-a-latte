"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from "recharts";
import { usePipeline } from "./PipelineContext";
import { sel, PIPELINE_COLOR } from "../lib/format";

const money = (n) => `$${Math.round(n).toLocaleString("en-US")}`;
const millions = (n) => `$${(n / 1_000_000).toFixed(1)}M`;
const axis = { fontFamily: "var(--font-karla)", fontSize: 12, fill: "#6b6570" };

// City stack palette (CAL brand: navy, teal, magenta, indigo, gold, red + tints).
const CITY_PALETTE = ["#1A428A", "#10CFC9", "#B5007C", "#2E2776", "#F2C400",
  "#E1352B", "#5C7CB5", "#6FE0DB", "#D45BAE", "#7A72B5"];

/* Revenue by year, stacked by top cities. Reacts to the pipeline toggle. */
export function RevenueByYearChart({ cities, meta, topN = 8 }) {
  const { mode } = usePipeline();
  // rank cities by revenue in the active mode
  const ranked = [...cities]
    .map((c) => ({ city: c.city, rev: sel(c.totals, mode, "revenue"), byYear: c.byYear }))
    .filter((c) => c.rev > 0)
    .sort((a, b) => b.rev - a.rev);
  const top = ranked.slice(0, topN);
  const topNames = top.map((c) => c.city);
  const data = meta.years.map((y) => {
    const row = { year: meta.yearLabels?.[y] || String(y) };
    let other = 0;
    ranked.forEach((c) => {
      const v = sel(c.byYear[y], mode, "revenue");
      if (topNames.includes(c.city)) row[c.city] = v;
      else other += v;
    });
    if (other > 0) row["Other"] = other;
    return row;
  });
  const keys = [...topNames, ...(data.some((d) => d["Other"]) ? ["Other"] : [])];
  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5dfe7" vertical={false} />
        <XAxis dataKey="year" tick={axis} />
        <YAxis tickFormatter={millions} tick={axis} width={54} />
        <Tooltip formatter={(v, n) => [money(v), n]} contentStyle={{ fontFamily: "var(--font-karla)", fontSize: 12 }} />
        <Legend wrapperStyle={{ fontFamily: "var(--font-karla)", fontSize: 11 }} />
        {keys.map((k, i) => (
          <Bar key={k} dataKey={k} stackId="a"
            fill={k === "Other" ? "#d7cdd9" : CITY_PALETTE[i % CITY_PALETTE.length]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

/* Per-show revenue by year (National vs Cafe Lines side by side). */
export function ShowYearChart({ byYear, years, yearLabels }) {
  const data = years.map((y) => {
    const v = byYear[y] || {};
    return {
      year: yearLabels?.[y] || String(y),
      National: (v.national || {}).revenue || 0,
      "Cafe Lines": (v.cafeLines || {}).revenue || 0,
      city: (v.national || v.cafeLines || {}).city || "",
    };
  });
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5dfe7" vertical={false} />
        <XAxis dataKey="year" tick={axis} />
        <YAxis tickFormatter={millions} tick={axis} width={54} />
        <Tooltip
          formatter={(v) => money(v)}
          labelFormatter={(y) => {
            const r = data.find((d) => d.year === y);
            return r && r.city ? `${y} - ${r.city}` : y;
          }}
          contentStyle={{ fontFamily: "var(--font-karla)", fontSize: 12 }} />
        <Legend wrapperStyle={{ fontFamily: "var(--font-karla)", fontSize: 12 }} />
        <Bar dataKey="National" fill={PIPELINE_COLOR.National} radius={[3, 3, 0, 0]} />
        <Bar dataKey="Cafe Lines" fill={PIPELINE_COLOR["Cafe Lines"]} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* Service mix over time for a show: top services stacked by year (active mode). */
export function ServiceMixChart({ byYear, years, yearLabels, topN = 6 }) {
  const { mode } = usePipeline();
  const pick = (v) => {
    if (!v) return {};
    if (mode === "National") return v.national?.services || {};
    if (mode === "Cafe Lines") return v.cafeLines?.services || {};
    const out = { ...(v.national?.services || {}) };
    for (const [k, n] of Object.entries(v.cafeLines?.services || {})) out[k] = (out[k] || 0) + n;
    return out;
  };
  const totals = {};
  years.forEach((y) => { for (const [k, n] of Object.entries(pick(byYear[y]))) totals[k] = (totals[k] || 0) + n; });
  const top = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, topN).map((x) => x[0]);
  if (top.length === 0) return <p className="font-body text-sm text-muted">No service detail for this pipeline.</p>;
  const data = years.map((y) => {
    const svc = pick(byYear[y]); const row = { year: yearLabels?.[y] || String(y) };
    top.forEach((k) => { row[k] = svc[k] || 0; }); return row;
  });
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5dfe7" vertical={false} />
        <XAxis dataKey="year" tick={axis} />
        <YAxis tick={axis} width={36} allowDecimals={false} />
        <Tooltip contentStyle={{ fontFamily: "var(--font-karla)", fontSize: 12 }} />
        <Legend wrapperStyle={{ fontFamily: "var(--font-karla)", fontSize: 11 }} />
        {top.map((k, i) => (
          <Bar key={k} dataKey={k} stackId="s" fill={CITY_PALETTE[i % CITY_PALETTE.length]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
