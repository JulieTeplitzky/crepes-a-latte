import { getShows, getPatterns } from "../lib/data";
import PatternStrip from "../components/PatternStrip";
import ShowsTable from "../components/ShowsTable";
import { SectionTitle } from "../components/ui";

const VALID = ["Fixed City", "Rotation with Anchor", "Full Rotation", "Month Drift", "Insufficient Data"];

export default async function PatternsPage({ searchParams }) {
  const [shows, patterns] = await Promise.all([getShows(), getPatterns()]);
  const p = searchParams?.p;
  const initial = VALID.includes(p) ? p : "All";
  return (
    <div className="space-y-8">
      <section>
        <h1 className="font-head text-3xl font-bold text-ink m-0">Pattern browser</h1>
        <p className="font-body text-muted mt-2 mb-0 max-w-3xl">
          Shows grouped by how their host city moves year to year. Fixed City, Rotation with Anchor,
          and Full Rotation are mutually exclusive and sum to grand revenue. Month Drift is an overlay
          for shows whose month wanders, which can make revenue look like it wobbles when demand is steady.
        </p>
      </section>
      <PatternStrip patterns={patterns} />
      <section>
        <SectionTitle sub="Filter is preset from the card you clicked. Click any row to open the show.">
          Shows by pattern
        </SectionTitle>
        <ShowsTable shows={shows} initialFilter={initial} />
      </section>
    </div>
  );
}
