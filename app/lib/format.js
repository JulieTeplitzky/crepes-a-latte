export const usd0 = (n) =>
  n == null ? "-" : `$${Math.round(n).toLocaleString("en-US")}`;

export const usdM = (n) =>
  n == null ? "-" : `$${(n / 1_000_000).toFixed(1)}M`;

export const pct = (n) => (n == null ? "-" : `${n}%`);

export const slugCity = (c) => encodeURIComponent(c);

// Pattern-class -> tailwind color token used across charts and chips
export const CLASS_COLOR = {
  "Fixed City": "#944197",
  "Rotation with Anchor": "#b56bb8",
  "Full Rotation": "#6d2f70",
  "One-Off / Custom": "#c9b9cb",
};

export const PIPELINE_COLOR = {
  National: "#944197",
  "Cafe Lines": "#d9a441",
};
