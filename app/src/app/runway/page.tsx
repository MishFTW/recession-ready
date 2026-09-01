import type { Metadata } from "next";
import Link from "next/link";
import RunwayCalculator from "@/components/RunwayCalculator";

export const metadata: Metadata = {
  title: "Layoff Runway Calculator — Recession Ready",
  description:
    "If your income stopped tomorrow, how many months could you last? Models liquid savings, severance, and your state's unemployment benefits.",
};

export default function RunwayPage() {
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
            href="/stress-test"
            className="hidden font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint transition-colors hover:text-ink sm:inline"
          >
            Stress test
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
            Layoff survival tool
          </p>
          <h1 className="mb-5 font-serif text-[clamp(38px,6vw,58px)] font-normal leading-[1.08] text-ink">
            How long is your <em className="italic text-amber">runway</em>?
          </h1>
          <p className="max-w-[650px] text-base leading-[1.75] text-ink-muted">
            Liquid runway is the heaviest-weighted category in the readiness
            audit, because it is the actual survival clock. This models the
            full picture after a layoff: your savings, any severance, and what
            your state&apos;s unemployment insurance really pays — which is
            probably less than you think.
          </p>
        </header>

        <RunwayCalculator />

        <section className="mt-12 border-t border-border pt-7 text-sm leading-relaxed text-ink-muted">
          <h2 className="mb-2 font-serif text-xl text-ink">
            Why six months is the bar
          </h2>
          <p className="max-w-[780px]">
            In ordinary times, a job search runs two to three months. In the
            Great Recession, the median spell of unemployment peaked above six
            months, and nearly half of the unemployed were out for more than
            27 weeks — past the point where most states&apos; benefits stop.
            Runway is what lets you decline a bad offer, and desperation
            pricing on your own labor is expensive.
          </p>
          <p className="mt-3 max-w-[780px] text-xs text-ink-faint">
            This is a planning model, not legal or tax advice. Benefit amounts
            are approximate and change every year; eligibility, dependent
            allowances, and severance offsets vary by state.
          </p>
        </section>
      </main>

      <footer className="mt-auto border-t border-border px-8 py-6 text-center font-mono text-xs text-ink-faint">
        Your inputs stay in your browser. No data collected or stored.
      </footer>
    </>
  );
}
