import { getMeta, getPatterns, getCities, getShows } from "./lib/data";
import { Stat, SectionTitle } from "./components/ui";
import {
  PatternRevenueChart,
  CityRevenueChart,
  EspressoDonut,
} from "./components/charts";
import ShowsTable from "./components/ShowsTable";
import { usdM, usd0 } from "./lib/format";
import Link from "next/link";

export default async function Home() {
  const [meta, patterns, cities, shows] = await Promise.all([
    getMeta(),
    getPatterns(),
    getCities(),
    getShows(),
  ]);

  const t = meta.totals;

  return (
    <div className="space-y-10">
      {/* Intro */}
      <section>
        <h1 className="font-head text-3xl sm:text-4xl font-bold text-ink m-0">
          How location relates to revenue
        </h1>
        <p className="font-body text-muted mt-2 mb-0 max-w-3xl">
          Where CAL shows land, and how that connects to revenue across{" "}
          {meta.dateRange.label}. National and Cafe Lines tracked separately.
          Every figure ties back to {usd0(t.grandRevenue)} in Won deals.
        </p>
      </section>

      {/* Scorecards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total revenue" value={usdM(t.grandRevenue)} hint={`${t.dealsInScope.toLocaleString()} deals`} />
        <Stat label="National" value={usdM(t.national.revenue)} hint={`${t.national.deals.toLocaleString()} deals`} />
        <Stat label="Cafe Lines" value={usdM(t.cafeLines.revenue)} hint={`${t.cafeLines.deals.toLocaleString()} deals`} />
        <Stat label="Espresso share" value={`${meta.espressoSplit.espressoSharePct}%`} hint="of revenue" />
      </section>

      {/* Headline: pattern vs revenue, split pipeline */}
      <section className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <PatternRevenueChart patterns={patterns} />
        </div>
        <EspressoDonut meta={meta} />
      </section>

      {/* Pattern bucket cards */}
      <section>
        <SectionTitle sub="Shows with 3+ years of history are classified by how their host city moves. One-Off / Custom holds shows with too little history to classify, so the buckets total to all revenue.">
          The four rotation patterns
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {patterns.map((p) => (
            <PatternCard key={p.cityPatternClass} p={p} grand={t.grandRevenue} />
          ))}
        </div>
      </section>

      {/* Cities */}
      <section id="cities" className="scroll-mt-20">
        <SectionTitle sub="Every deal attributed to the city it landed in.">
          Cities
        </SectionTitle>
        <CityRevenueChart cities={cities} topN={12} />
      </section>

      {/* Shows table */}
      <section id="shows" className="scroll-mt-20">
        <SectionTitle sub="Click any show to see its city rotation and revenue year over year.">
          Shows
        </SectionTitle>
        <ShowsTable shows={shows} />
      </section>
    </div>
  );
}

function PatternCard({ p, grand }) {
  const color = {
    "Fixed City": "#944197",
    "Rotation with Anchor": "#b56bb8",
    "Full Rotation": "#6d2f70",
    "One-Off / Custom": "#c9b9cb",
  }[p.cityPatternClass];
  const share = Math.round((p.totalRevenue / grand) * 100);
  return (
    <div className="bg-paper border border-line rounded-xl p-4 border-t-4" style={{ borderTopColor: color }}>
      <h3 className="font-head text-base font-bold text-ink m-0">
        {p.cityPatternClass}
      </h3>
      <div className="font-head text-2xl font-bold mt-2" style={{ color }}>
        {usdM(p.totalRevenue)}
      </div>
      <div className="font-body text-xs text-muted">
        {share}% of revenue · {p.showCount} shows
      </div>
      <div className="mt-3 h-2 rounded-full bg-mist overflow-hidden">
        <div className="h-full" style={{ width: `${share}%`, background: color }} />
      </div>
      <div className="font-body text-xs text-muted mt-3 leading-snug">
        {p.description}
      </div>
      {p.showsWithMonthDrift > 0 ? (
        <div className="font-body text-xs text-purple mt-2">
          {p.showsWithMonthDrift} also drift on month
        </div>
      ) : null}
    </div>
  );
}
