import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-line bg-paper">
      <div className="w-full max-w-[1400px] mx-auto px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-baseline gap-3 no-underline">
          <span className="font-head text-ink text-xl font-bold tracking-tight">
            Crepes a Latte
          </span>
          <span className="font-body text-muted text-sm hidden sm:inline">
            Location &amp; Revenue Analysis
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-sm font-body">
          <Link href="/" className="text-ink hover:text-purple no-underline">
            Overview
          </Link>
          <Link href="/#shows" className="text-ink hover:text-purple no-underline">
            Shows
          </Link>
          <Link href="/#cities" className="text-ink hover:text-purple no-underline">
            Cities
          </Link>
        </nav>
      </div>
    </header>
  );
}
