"use client";

// Small presentational primitives shared across views.

export function Card({ children, className = "" }) {
  return <div className={`bg-paper border border-line rounded-xl p-5 ${className}`}>{children}</div>;
}

export function SectionTitle({ children, sub }) {
  return (
    <div className="mb-4">
      <h2 className="font-head text-ink text-2xl font-bold m-0">{children}</h2>
      {sub ? <p className="font-body text-muted text-sm mt-1 mb-0">{sub}</p> : null}
    </div>
  );
}

export function Stat({ label, value, hint, accent }) {
  return (
    <div className="bg-mist border border-line rounded-xl p-4">
      <div className="font-body text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="font-head text-2xl font-bold mt-1" style={{ color: accent || "#111014" }}>{value}</div>
      {hint ? <div className="font-body text-xs text-muted mt-1">{hint}</div> : null}
    </div>
  );
}

export function Chip({ children, color }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-body border"
      style={{ borderColor: color, color }}>
      <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
      {children}
    </span>
  );
}
