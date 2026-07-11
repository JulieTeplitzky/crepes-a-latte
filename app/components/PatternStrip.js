"use client";

import Link from "next/link";
import { usePipeline } from "./PipelineContext";
import { sel, usdM, CLASS_COLOR } from "../lib/format";

// Clickable pattern cards. Each links into the pattern browser pre-filtered.
// Revenue follows the active pipeline. Month Drift is shown as an overlay card.
export default function PatternStrip({ patterns }) {
  const { mode } = usePipeline();
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
      {patterns.map((p) => {
        const rev = sel({ national: { r: p.revenue.national }, cafeLines: { r: p.revenue.cafeLines } }, mode, "r");
        const color = CLASS_COLOR[p.key] || "#1A428A";
        return (
          <Link key={p.key} href={`/patterns?p=${encodeURIComponent(p.key)}`}
            className="no-underline bg-paper border border-line rounded-xl p-4 border-t-4 hover:shadow-sm transition-shadow"
            style={{ borderTopColor: color }}>
            <div className="font-head text-sm font-bold text-ink m-0">{p.key}</div>
            <div className="font-head text-xl font-bold mt-1" style={{ color }}>{usdM(rev)}</div>
            <div className="font-body text-xs text-muted">{p.showCount} shows {p.kind === "overlay" ? "· overlay" : ""}</div>
          </Link>
        );
      })}
    </div>
  );
}
