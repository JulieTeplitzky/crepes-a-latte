// Footer with the Crêpes à Latte brand color bar (from the IHG proposal).
const BAR = ["#1A428A", "#10CFC9", "#F2C400", "#3c3733", "#10CFC9", "#E1352B", "#B5007C", "#1A428A"];

export default function Footer({ meta }) {
  return (
    <footer className="mt-10">
      <div className="brandbar">
        {BAR.map((c, i) => <span key={i} style={{ background: c }} />)}
      </div>
      <div className="w-full max-w-screen mx-auto px-5 sm:px-8 py-4 flex flex-wrap gap-2 justify-between">
        <p className="eyebrow text-[11px] text-muted m-0">
          Crêpes à Latte · Location &amp; Revenue {meta?.dateRange?.label || ""}
        </p>
        <p className="eyebrow text-[11px] text-muted m-0">
          Won deals at real dollar value · Generated {meta?.generatedAt || ""}
        </p>
      </div>
    </footer>
  );
}
