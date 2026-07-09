"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
} from "recharts";
import { PIPELINE_COLOR, CLASS_COLOR } from "../lib/format";

const money = (n) => `$${Math.round(n).toLocaleString("en-US")}`;
const millions = (n) => `$${(n / 1_000_000).toFixed(1)}M`;

const axisStyle = { fontFamily: "var(--font-karla)", fontSize: 12, fill: "#6b6570" };

function Box({ children }) {
  return (
    <div className="bg-paper border border-line rounded-xl p-5">{children}</div>
  );
}

/* Revenue by rotation pattern, National vs Cafe Lines (the headline view) */
export function PatternRevenueChart({ patterns }) {
  const data = patterns.map((p) => ({
    name: p.cityPatternClass,
    National: p.revenueByPipeline.National,
    "Cafe Lines": p.revenueByPipeline["Cafe Lines"],
  }));
  return (
    <Box>
      <h3 className="font-head text-lg font-bold text-purple m-0 mb-1">
        Revenue by city-rotation pattern
      </h3>
      <p className="font-body text-sm text-muted mt-0 mb-4">
        National vs Cafe Lines. Full Rotation and Rotation-with-Anchor shows
        carry the most revenue, and both are the shows where the city changes.
      </p>
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5dfe7" vertical={false} />
          <XAxis dataKey="name" tick={axisStyle} interval={0} height={50} />
          <YAxis tickFormatter={millions} tick={axisStyle} width={54} />
          <Tooltip formatter={(v) => money(v)} contentStyle={{ fontFamily: "var(--font-karla)" }} />
          <Legend wrapperStyle={{ fontFamily: "var(--font-karla)", fontSize: 13 }} />
          <Bar dataKey="National" fill={PIPELINE_COLOR.National} radius={[3, 3, 0, 0]} />
          <Bar dataKey="Cafe Lines" fill={PIPELINE_COLOR["Cafe Lines"]} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

/* Top cities by revenue, stacked National + Cafe Lines */
export function CityRevenueChart({ cities, topN = 12 }) {
  const data = cities.slice(0, topN).map((c) => ({
    name: c.city,
    National: c.byPipeline.national.revenue,
    "Cafe Lines": c.byPipeline.cafeLines.revenue,
  }));
  return (
    <Box>
      <h3 className="font-head text-lg font-bold text-purple m-0 mb-1">
        Where the revenue lands: top cities
      </h3>
      <p className="font-body text-sm text-muted mt-0 mb-4">
        Every deal by the city it landed in. Chicago is the anchor market for
        both pipelines.
      </p>
      <ResponsiveContainer width="100%" height={Math.max(320, data.length * 30)}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5dfe7" horizontal={false} />
          <XAxis type="number" tickFormatter={millions} tick={axisStyle} />
          <YAxis
            type="category"
            dataKey="name"
            tick={axisStyle}
            width={120}
          />
          <Tooltip formatter={(v) => money(v)} contentStyle={{ fontFamily: "var(--font-karla)" }} />
          <Legend wrapperStyle={{ fontFamily: "var(--font-karla)", fontSize: 13 }} />
          <Bar dataKey="National" stackId="a" fill={PIPELINE_COLOR.National} />
          <Bar dataKey="Cafe Lines" stackId="a" fill={PIPELINE_COLOR["Cafe Lines"]} radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

/* Espresso vs other revenue share */
export function EspressoDonut({ meta }) {
  const e = meta.espressoSplit;
  const data = [
    { name: "Includes espresso", value: e.espressoRevenue },
    { name: "No espresso", value: e.otherRevenue },
  ];
  const colors = ["#944197", "#c9b9cb"];
  return (
    <Box>
      <h3 className="font-head text-lg font-bold text-purple m-0 mb-1">
        Espresso share of revenue
      </h3>
      <p className="font-body text-sm text-muted mt-0 mb-2">
        Share of revenue from deals that include Espresso Service.
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={colors[i]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => money(v)} contentStyle={{ fontFamily: "var(--font-karla)" }} />
        </PieChart>
      </ResponsiveContainer>
      <p className="font-head text-center text-2xl font-bold text-ink m-0">
        {e.espressoSharePct}%
      </p>
      <p className="font-body text-center text-xs text-muted mt-0">
        of ${Math.round(meta.totals.grandRevenue).toLocaleString("en-US")} total
      </p>
    </Box>
  );
}

/* Per-show year-over-year revenue with city labels (drill-down, step 4) */
export function ShowYearChart({ byYear }) {
  const years = Object.keys(byYear).sort();
  const data = years.map((y) => {
    const nat = byYear[y].national || {};
    const cl = byYear[y].cafeLines || {};
    return {
      year: y,
      National: nat.revenue || 0,
      "Cafe Lines": cl.revenue || 0,
      city: (nat.city || cl.city) ?? "",
    };
  });
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5dfe7" vertical={false} />
        <XAxis
          dataKey="year"
          tick={axisStyle}
          height={44}
          tickFormatter={(y) => y}
        />
        <YAxis tickFormatter={millions} tick={axisStyle} width={54} />
        <Tooltip
          formatter={(v) => money(v)}
          labelFormatter={(y) => {
            const row = data.find((d) => d.year === y);
            return row && row.city ? `${y} - ${row.city}` : y;
          }}
          contentStyle={{ fontFamily: "var(--font-karla)" }}
        />
        <Legend wrapperStyle={{ fontFamily: "var(--font-karla)", fontSize: 13 }} />
        <Bar dataKey="National" fill={PIPELINE_COLOR.National} radius={[3, 3, 0, 0]} />
        <Bar dataKey="Cafe Lines" fill={PIPELINE_COLOR["Cafe Lines"]} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
