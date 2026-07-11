import Link from "next/link";
import PipelineToggle from "./PipelineToggle";

export default function Header() {
  return (
    <header className="border-b border-line bg-paper sticky top-0 z-20">
      <div className="w-full max-w-screen mx-auto px-5 sm:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="no-underline text-ink">
            <span className="font-head text-xl font-bold uppercase tracking-wide border border-ink rounded-sm px-2 py-0.5">
              Crêpes à Latte
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-5 text-sm font-body">
            <Link href="/" className="text-ink hover:text-purple no-underline">Overview</Link>
            <Link href="/patterns" className="text-ink hover:text-purple no-underline">Patterns</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline font-body text-xs text-muted">Pipeline</span>
          <PipelineToggle />
        </div>
      </div>
    </header>
  );
}
