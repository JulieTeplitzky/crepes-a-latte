import { getMeta, getShows, getCities, getPatterns } from "./lib/data";
import Scorecards from "./components/Scorecards";
import PatternStrip from "./components/PatternStrip";
import ShowsTable from "./components/ShowsTable";
import { RevenueByYearChart } from "./components/charts";
import { Card, SectionTitle } from "./components/ui";

export default async function Home() {
  const [meta, shows, cities, patterns] = await Promise.all([
    getMeta(), getShows(), getCities(), getPatterns(),
  ]);
  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-head text-3xl sm:text-4xl font-bold text-ink m-0">
          How location relates to revenue
        </h1>
        <p className="font-body text-muted mt-2 mb-0 max-w-3xl">
          Where CAL shows land, and how that connects to revenue across {meta.dateRange.label}.
          Use the pipeline toggle in the header to switch between National, Cafe Lines, or Both.
          National is the default because Cafe Lines revenue distorts the aggregate view.
        </p>
      </section>

      <Scorecards meta={meta} />

      <section>
        <Card>
          <h2 className="font-head text-lg font-bold text-purple m-0 mb-1">Revenue by year, by host city</h2>
          <p className="font-body text-sm text-muted mt-0 mb-4">
            Top cities stacked per year. Reacts to the pipeline toggle.
          </p>
          <RevenueByYearChart cities={cities} meta={meta} />
        </Card>
      </section>

      <section>
        <SectionTitle sub="Click a pattern to browse the shows in it. Month Drift overlaps the city classes and is not additive to grand revenue.">
          Rotation patterns
        </SectionTitle>
        <PatternStrip patterns={patterns} />
      </section>

      <section id="shows">
        <SectionTitle sub="Filter by pattern, search, or click any row to open a show's rotation history and service mix.">
          Shows
        </SectionTitle>
        <ShowsTable shows={shows} />
      </section>
    </div>
  );
}
