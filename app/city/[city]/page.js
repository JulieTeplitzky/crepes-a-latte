import Link from "next/link";
import { notFound } from "next/navigation";
import { getCities, getCity, getShows } from "../../lib/data";
import { Stat } from "../../components/ui";
import { usd0, pct, CLASS_COLOR, slugCity } from "../../lib/format";

export async function generateStaticParams() {
  const cities = await getCities();
  const params = cities.map((c) => ({ city: slugCity(c.city) }));
  // BUILD_SAMPLE trims prerender count for quick local verification only.
  return process.env.BUILD_SAMPLE ? params.slice(0, 3) : params;
}

export default async function CityPage({ params }) {
  const city = await getCity(params.city);
  if (!city) notFound();
  const shows = await getShows();

  // shows that landed in this city, with the years they were here
  const here = shows
    .filter((s) => city.showAcronyms.includes(s.acronym))
    .map((s) => {
      const yrs = Object.entries(s.byYear)
        .filter(([, v]) =>
          [v.national, v.cafeLines].some((p) => p && p.city === city.city)
        )
        .map(([y]) => y);
      return { ...s, yearsHere: yrs };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  const years = Object.keys(city.byYear).sort();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/#cities" className="font-body text-sm text-purple no-underline">
          ← All cities
        </Link>
        <h1 className="font-head text-3xl font-bold text-ink m-0 mt-2">
          {city.city}
        </h1>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total revenue" value={usd0(city.totalRevenue)} hint={`${city.dealCount} deals`} />
        <Stat label="National" value={usd0(city.byPipeline.national.revenue)} hint={`${city.byPipeline.national.deals} deals`} />
        <Stat label="Cafe Lines" value={usd0(city.byPipeline.cafeLines.revenue)} hint={`${city.byPipeline.cafeLines.deals} deals`} />
        <Stat label="Distinct shows" value={city.distinctShows} hint={`${pct(city.espressoSharePct)} espresso`} />
      </section>

      <section>
        <h2 className="font-head text-lg font-bold text-ink m-0 mb-3">By year</h2>
        <div className="border border-line rounded-xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-mist">
              <tr>
                {["Year", "Revenue", "Deals"].map((h, i) => (
                  <th
                    key={h}
                    className={`font-body text-xs uppercase tracking-wide text-muted py-2 px-3 ${
                      i ? "text-right" : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {years.map((y) => (
                <tr key={y} className="border-t border-line">
                  <td className="py-2 px-3 font-body">{y}</td>
                  <td className="py-2 px-3 text-right font-body tabular-nums">
                    {usd0(city.byYear[y].revenue)}
                  </td>
                  <td className="py-2 px-3 text-right font-body tabular-nums text-muted">
                    {city.byYear[y].deals}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-head text-lg font-bold text-ink m-0 mb-3">
          Shows that land here
        </h2>
        <div className="border border-line rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-mist">
              <tr>
                {["Show", "Pattern", "Years here", "Total revenue"].map((h, i) => (
                  <th
                    key={h}
                    className={`font-body text-xs uppercase tracking-wide text-muted py-2 px-3 ${
                      i === 3 ? "text-right" : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {here.map((s) => (
                <tr key={s.acronym} className="border-t border-line hover:bg-mist">
                  <td className="py-2 px-3">
                    <Link
                      href={`/show/${encodeURIComponent(s.acronym)}`}
                      className="font-body font-semibold text-ink hover:text-purple no-underline"
                    >
                      {s.acronym}
                    </Link>
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className="text-xs font-body"
                      style={{ color: CLASS_COLOR[s.cityPatternClass] }}
                    >
                      {s.cityPatternClass}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-body text-xs text-muted">
                    {s.yearsHere.join(", ") || "-"}
                  </td>
                  <td className="py-2 px-3 text-right font-body tabular-nums">
                    {usd0(s.totalRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
