"use client";

import Link from "next/link";
import { usePipeline } from "./PipelineContext";
import { Stat, Chip } from "./ui";
import { ShowYearChart, ServiceMixChart } from "./charts";
import { sel, usd0, pct, citySlug, CLASS_COLOR } from "../lib/format";

export default function ShowDetailClient({ show, meta }) {
  const { mode } = usePipeline();
  const yl = meta.yearLabels || {};
  const cityByYear = show.years.map((y) => {
    const v = show.byYear[y] || {};
    return { year: y, city: (v.national || v.cafeLines || {}).city, month: (v.national || v.cafeLines || {}).month };
  });
  const citiesUsed = [...new Set(cityByYear.map((r) => r.city).filter(Boolean))];

  return (
    <div className="space-y-8">
      <div>
        <Link href="/#shows" className="font-body text-sm text-purple no-underline">← All shows</Link>
        <div className="flex flex-wrap items-baseline gap-3 mt-2">
          <h1 className="font-head text-3xl font-bold text-ink m-0">{show.acronym}</h1>
          {show.fullName && show.fullName !== show.acronym
            ? <span className="font-body text-muted">{show.fullName}</span> : null}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Chip color={CLASS_COLOR[show.cityPattern.class]}>{show.cityPattern.label}</Chip>
          <Chip color={show.monthPattern.monthDrift ? "#B5007C" : "#6e6a66"}>{show.monthPattern.label}</Chip>
          <Chip color="#6b6570">{show.pipelines.join(" + ")}</Chip>
        </div>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label={`Revenue · ${mode}`} value={usd0(sel(show.totals, mode, "revenue"))}
          hint={`${sel(show.totals, mode, "deals")} deals`} accent={mode === "Cafe Lines" ? "#B5007C" : "#1A428A"} />
        <Stat label="Espresso share" value={pct(mode === "Cafe Lines" ? show.totals.cafeLines.espressoSharePct : show.totals.national.espressoSharePct)} hint={mode === "Both" ? "National shown" : "of revenue"} />
        <Stat label="Years active" value={show.years.length} hint={show.years.join(", ")} />
        <Stat label="Cities used" value={citiesUsed.length} hint={citiesUsed.join(", ")} />
      </section>

      <section className="bg-paper border border-line rounded-xl p-5">
        <h2 className="font-head text-lg font-bold text-purple m-0 mb-1">Rotation history: where it lands vs. revenue</h2>
        <p className="font-body text-sm text-muted mt-0 mb-4">
          Cities: {cityByYear.map((r) => r.city).join(" → ")}
          {show.monthPattern.monthDrift ? <><br />Months it moves between: {show.monthPattern.months.join(" / ")}</> : null}
        </p>
        <ShowYearChart byYear={show.byYear} years={show.years} yearLabels={yl} />
      </section>

      <section className="bg-paper border border-line rounded-xl p-5">
        <h2 className="font-head text-lg font-bold text-purple m-0 mb-1">Service mix over time</h2>
        <p className="font-body text-sm text-muted mt-0 mb-4">Top services by deal count per year ({mode}). Approximate, from deal descriptions.</p>
        <ServiceMixChart byYear={show.byYear} years={show.years} yearLabels={yl} />
      </section>

      <section>
        <h2 className="font-head text-lg font-bold text-ink m-0 mb-3">By year</h2>
        <div className="border border-line rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-mist">
              <tr>{["Year", "City", "Month", "National", "Cafe Lines"].map((h, i) => (
                <th key={h} className={`font-body text-xs uppercase tracking-wide text-muted py-2 px-3 ${i >= 3 ? "text-right" : "text-left"}`}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {show.years.map((y) => {
                const v = show.byYear[y] || {};
                const city = (v.national || v.cafeLines || {}).city;
                const month = (v.national || v.cafeLines || {}).month;
                return (
                  <tr key={y} className="border-t border-line">
                    <td className="py-2 px-3 font-body">{yl[y] || y}</td>
                    <td className="py-2 px-3 font-body">
                      {city ? <Link href={`/city/${citySlug(city)}`} className="text-ink hover:text-purple no-underline">{city}</Link> : "-"}
                    </td>
                    <td className="py-2 px-3 font-body text-muted">{month || "-"}</td>
                    <td className="py-2 px-3 text-right font-body tabular-nums">{usd0((v.national || {}).revenue)}</td>
                    <td className="py-2 px-3 text-right font-body tabular-nums text-muted">{usd0((v.cafeLines || {}).revenue)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
