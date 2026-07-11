// Formatting + pipeline-selection helpers shared across views.

export const usd0 = (n) =>
  n == null ? "-" : `$${Math.round(n).toLocaleString("en-US")}`;
export const usdM = (n) =>
  n == null ? "-" : `$${(n / 1_000_000).toFixed(1)}M`;
export const pct = (n) => (n == null ? "-" : `${n}%`);

// Pipeline modes for the National / Cafe Lines / Both toggle.
export const MODES = ["National", "Cafe Lines", "Both"];

// Pull a numeric field out of a { national, cafeLines } split for the active
// pipeline mode. "Both" sums the two. This is what makes the pipeline filter a
// client-side toggle over one dataset.
export function sel(split, mode, field) {
  if (!split) return 0;
  const n = split.national ? split.national[field] || 0 : 0;
  const c = split.cafeLines ? split.cafeLines[field] || 0 : 0;
  if (mode === "National") return n;
  if (mode === "Cafe Lines") return c;
  return n + c;
}

// Slug for routing to a city page (mirrors the pipeline's slug rule).
export const citySlug = (c) =>
  (c || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown";

// Colors (Crêpes à Latte brand)
export const PIPELINE_COLOR = { National: "#1A428A", "Cafe Lines": "#B5007C" };
export const CLASS_COLOR = {
  "Fixed City": "#1A428A",
  "Rotation with Anchor": "#0E9E99",
  "Full Rotation": "#2E2776",
  "Month Drift": "#B5007C",
  "Insufficient Data": "#9a948e",
};
