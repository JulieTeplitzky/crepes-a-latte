"use client";

import { usePipeline } from "./PipelineContext";
import { MODES } from "../lib/format";

// Prominent segmented control in the header. National is the default and is
// styled as the primary state; Cafe Lines and Both are one click away.
export default function PipelineToggle() {
  const { mode, setMode } = usePipeline();
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-mist p-0.5">
      {MODES.map((m) => {
        const active = mode === m;
        const color = m === "Cafe Lines" ? "#B5007C" : "#1A428A";
        return (
          <button
            key={m}
            onClick={() => setMode(m)}
            aria-pressed={active}
            className="font-body text-sm rounded-full px-3.5 py-1.5 transition-colors"
            style={
              active
                ? { background: m === "Both" ? "#111014" : color, color: "#fff" }
                : { background: "transparent", color: "#6b6570" }
            }
          >
            {m}
          </button>
        );
      })}
    </div>
  );
}
