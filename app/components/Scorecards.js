"use client";

import { usePipeline } from "./PipelineContext";
import { Stat } from "./ui";
import { usdM } from "../lib/format";

// Headline scorecards that follow the pipeline toggle.
export default function Scorecards({ meta }) {
  const { mode } = usePipeline();
  const n = meta.totals.byPipeline.national;
  const c = meta.totals.byPipeline.cafeLines;
  const pick = (a, b) => (mode === "National" ? a : mode === "Cafe Lines" ? b : a + b);

  const revenue = pick(n.revenue, c.revenue);
  const deals = pick(n.deals, c.deals);
  const espN = meta.espresso.byPipeline.national.sharePct;
  const espC = meta.espresso.byPipeline.cafeLines.sharePct;
  const espresso =
    mode === "National" ? espN
    : mode === "Cafe Lines" ? espC
    : n.revenue + c.revenue
      ? Math.round(((n.revenue * espN + c.revenue * espC) / (n.revenue + c.revenue)) * 10) / 10
      : 0;

  const accent = mode === "Cafe Lines" ? "#B5007C" : "#1A428A";
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Stat label={`Revenue · ${mode}`} value={usdM(revenue)} hint={`${deals.toLocaleString()} deals`} accent={accent} />
      <Stat label="Shows" value={meta.totals.uniqueShows} hint={`${meta.dateRange.label}`} />
      <Stat label="Cities" value={meta.totals.distinctCities} hint="host cities" />
      <Stat label="Espresso share" value={`${espresso}%`} hint="of revenue" accent={accent} />
    </div>
  );
}
