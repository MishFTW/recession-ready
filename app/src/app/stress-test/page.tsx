import type { Metadata } from "next";
import Link from "next/link";
import StressTest from "@/components/StressTest";

export const metadata: Metadata = {
  title: "Recession Stress Test — Recession Ready",
  description:
    "Replay eight historical US downturns — from the Great Depression to the COVID crash — against your actual portfolio, savings, and monthly burn.",
};

export default function StressTestPage() {
  return (
    <>
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-cream/95 px-6 py-4 backdrop-blur md:px-8">
        <Link
          href="/"
          className="font-mono text-[13px] tracking-[0.05em] text-amber"
        >
          recession-ready.fyi
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/runway"
            className="hidden font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint transition-colors hover:text-ink sm:inline"
          >
            Layoff runway
          </Link>
          <Link
            href="/rent-vs-buy"
            className="hidden font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint transition-colors hover:text-ink sm:inline"
          >
            Rent vs. buy
          </Link>
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint transition-colors hover:text-ink"
          >
            Take the readiness audit &rarr;
          </Link>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-6 py-10 md:px-8 md:py-14">
        <header className="mb-10 max-w-[720px]">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.12em] text-amber">
            Historical stress test
          </p>
          <h1 className="mb-5 font-serif text-[clamp(38px,6vw,58px)] font-normal leading-[1.08] text-ink">
            What would <em className="italic text-amber">1929</em> do to your
            money?
          </h1>
          <p className="max-w-[650px] text-base leading-[1.75] text-ink-muted">
            Every downturn feels unprecedented while it is happening. None of
            them are. Pick one of eight documented US recessions and replay its
            actual market drawdown, unemployment, and recovery timeline against
            your portfolio and cash position.
          </p>
        </header>

        <StressTest />

        <section className="mt-12 border-t border-border pt-7 text-sm leading-relaxed text-ink-muted">
          <h2 className="mb-2 font-serif text-xl text-ink">
            How to read this
          </h2>
          <p className="max-w-[780px]">
            The point is not prediction — it is calibration. A 57% drawdown
            sounds abstract until it is your account balance; a five-year
            recovery sounds survivable until you check it against your cash
            runway. The people who got destroyed in past recessions were mostly
            the ones forced to sell assets or take on debt at the bottom.
            Runway is what removes the word &ldquo;forced.&rdquo;
          </p>
          <p className="mt-3 max-w-[780px] text-xs text-ink-faint">
            This is a planning model, not investment advice. Past drawdowns do
            not bound future ones, non-stock assets can also fall, and the
            model ignores taxes, dividends, and contributions made during the
            downturn (which historically helped a lot).
          </p>
        </section>
      </main>

      <footer className="mt-auto border-t border-border px-8 py-6 text-center font-mono text-xs text-ink-faint">
        Your inputs stay in your browser. No data collected or stored.
      </footer>
    </>
  );
}
