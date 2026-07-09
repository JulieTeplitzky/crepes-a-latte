import Link from "next/link";
import { notFound } from "next/navigation";
import { getShows, getShow } from "../../lib/data";
import { ShowYearChart } from "../../components/charts";
import { Stat, Chip } from "../../components/ui";
import { usd0, pct, CLASS_COLOR, slugCity } from "../../lib/format";

export async function generateStaticParams() {
  const shows = await getShows();
  const params = shows.map((s) => ({ acronym: encodeURIComponent(s.acronym) }));
  // BUILD_SAMPLE trims prerender count for quick local verification only.
  return process.env.BUILD_SAMPLE ? params.slice(0, 3) : params;
}

export default async function ShowPage({ params }) {
  const show = await getShow(params.acronym);
  if (!show) notFound();

  const years = Object.keys(show.byYear).sort();
  // months it moves between, in year order (drill-down of month drift)
  const monthSeq = years
    .map((y) => {
      const m = (show.byYear[y].national || show.byYear[y].cafeLines || {}).month;
      return m ? m.split(" ")[0] : null;
    })
    .filter(Boolean);
  const citySeq = years
    .map((y) => (show.byYear[y].national || show.byYear[y].cafeLines || {}).city)
    .filter(Boolean);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/#shows" className="font-body text-sm text-purple no-underline">
          ← All shows
        </Link>
        <div className="flex flex-wrap items-baseline gap-3 mt-2">
          <h1 className="font-head text-3xl font-bold text-ink m-0">
            {show.acronym}
          </h1>
          {show.fullName && show.fullName !== show.acronym ? (
            <span className="font-body text-muted">{show.fullName}</span>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Chip color={CLASS_COLOR[show.cityPatternClass]}>
            {show.cityPatternDetail || show.cityPatternClass}
          </Chip>
          <Chip color={show.monthDrift ? "#944197" : "#6b6570"}>
            {show.monthPatternDetail || show.monthPatternClass}
          </Chip>
          <Chip color="#6b6570">{show.pipelines.join(" + ")}</Chip>
          {show.inFS ? null : <Chip color="#d9a441">Not yet in FS</Chip>}
        </div>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total revenue" value={usd0(show.totalRevenue)} hint={`${show.dealCount} deals`} />
        <Stat label="Espresso share" value={pct(show.espressoSplit.espressoSharePct)} hint="of this show's revenue" />
        <Stat label="Years active" value={show.years.length} hint={show.years.join(", ")} />
        <Stat label="Cities used" value={new Set(citySeq).size} hint={[...new Set(citySeq)].join(", ")} />
      </section>

      <section className="bg-paper border border-line rounded-xl p-5">
        <h2 className="font-head text-lg font-bold text-purple m-0 mb-1">
          Where it lands vs. revenue, year over year
        </h2>
        <p className="font-body text-sm text-muted mt-0 mb-4">
          Cities: {citySeq.join(" → ")}
          {show.monthDrift ? (
            <>
              <br />
              Months it moves between: {[...new Set(monthSeq)].join(" / ")}
            </>
          ) : null}
        </p>
        <ShowYearChart byYear={show.byYear} />
      </section>

      <section>
        <h2 className="font-head text-lg font-bold text-ink m-0 mb-3">
          By year
        </h2>
        <div className="border border-line rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-mist">
              <tr>
                {["Year", "Pipeline", "City", "Month", "Revenue", "Deals"].map((h, i) => (
                  <th
                    key={h}
                    className={`font-body text-xs uppercase tracking-wide text-muted py-2 px-3 ${
                      i >= 4 ? "text-right" : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {years.flatMap((y) =>
                [
                  ["National", show.byYear[y].national],
                  ["Cafe Lines", show.byYear[y].cafeLines],
                ]
                  .filter(([, v]) => v)
                  .map(([pipe, v]) => (
                    <tr key={`${y}-${pipe}`} className="border-t border-line">
                      <td className="py-2 px-3 font-body">{y}</td>
                      <td className="py-2 px-3 font-body text-muted">{pipe}</td>
                      <td className="py-2 px-3 font-body">
                        <Link
                          href={`/city/${slugCity(v.city)}`}
                          className="text-ink hover:text-purple no-underline"
                        >
                          {v.city}
                        </Link>
                      </td>
                      <td className="py-2 px-3 font-body text-muted">{v.month}</td>
                      <td className="py-2 px-3 text-right font-body tabular-nums">
                        {usd0(v.revenue)}
                      </td>
                      <td className="py-2 px-3 text-right font-body tabular-nums text-muted">
                        {v.deals}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
