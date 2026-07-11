"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Stat } from "./ui";
import { usd0, CLASS_COLOR } from "../lib/format";

// City detail always shows National vs Cafe Lines side by side (the demo ask),
// independent of the header toggle.
export default function CityDetailClient({ city, meta }) {
  const router = useRouter();
  const yl = meta.yearLabels || {};
  const nat = city.totals.national, cl = city.totals.cafeLines;
  return (
    <div className="space-y-8">
      <div>
        <Link href="/#shows" className="font-body text-sm text-purple no-underline">← All shows</Link>
        <h1 className="font-head text-3xl font-bold text-ink m-0 mt-2">{city.city}</h1>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="National" value={usd0(nat.revenue)} hint={`${nat.deals} deals`} accent="#1A428A" />
        <Stat label="Cafe Lines" value={usd0(cl.revenue)} hint={`${cl.deals} deals`} accent="#B5007C" />
        <Stat label="Combined" value={usd0(nat.revenue + cl.revenue)} hint={`${nat.deals + cl.deals} deals`} />
        <Stat label="Distinct shows" value={city.distinctShows} hint="land here" />
      </section>

      <section>
        <h2 className="font-head text-lg font-bold text-ink m-0 mb-3">By year, National vs Cafe Lines</h2>
        <div className="border border-line rounded-xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-mist">
              <tr>{["Year", "National", "Cafe Lines", "Combined"].map((h, i) => (
                <th key={h} className={`font-body text-xs uppercase tracking-wide text-muted py-2 px-3 ${i ? "text-right" : "text-left"}`}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {meta.years.filter((y) => city.byYear[y]).map((y) => {
                const r = city.byYear[y];
                return (
                  <tr key={y} className="border-t border-line">
                    <td className="py-2 px-3 font-body">{yl[y] || y}</td>
                    <td className="py-2 px-3 text-right font-body tabular-nums">{usd0(r.national.revenue)}</td>
                    <td className="py-2 px-3 text-right font-body tabular-nums text-muted">{usd0(r.cafeLines.revenue)}</td>
                    <td className="py-2 px-3 text-right font-body tabular-nums">{usd0(r.national.revenue + r.cafeLines.revenue)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-head text-lg font-bold text-ink m-0 mb-3">Shows that land here</h2>
        <div className="border border-line rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-mist">
              <tr>{["Show", "Pattern", "Years here", "National", "Cafe Lines"].map((h, i) => (
                <th key={h} className={`font-body text-xs uppercase tracking-wide text-muted py-2 px-3 ${i >= 3 ? "text-right" : "text-left"}`}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {city.shows.map((s) => (
                <tr key={s.acronym} className="row-link border-t border-line hover:bg-mist"
                  onClick={() => router.push(`/show/${slugify(s.acronym)}`)}>
                  <td className="py-2 px-3">
                    <span className="font-body font-semibold text-ink">{s.acronym}</span>
                    {s.fullName && s.fullName !== s.acronym ? <span className="font-body text-muted text-xs ml-2">{s.fullName}</span> : null}
                  </td>
                  <td className="py-2 px-3 text-xs font-body" style={{ color: CLASS_COLOR[patternClassOf(s.cityPatternLabel)] }}>{s.cityPatternLabel}</td>
                  <td className="py-2 px-3 font-body text-xs text-muted">{s.yearsHere.join(", ")}</td>
                  <td className="py-2 px-3 text-right font-body tabular-nums">{usd0(s.revenue.national)}</td>
                  <td className="py-2 px-3 text-right font-body tabular-nums text-muted">{usd0(s.revenue.cafeLines)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

const slugify = (a) => a.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unspecified";
function patternClassOf(label) {
  if (!label) return "Insufficient Data";
  if (label.startsWith("Fixed City")) return "Fixed City";
  if (label.startsWith("Rotation with Anchor")) return "Rotation with Anchor";
  if (label.startsWith("Full Rotation")) return "Full Rotation";
  return "Insufficient Data";
}
