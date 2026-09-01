import type { Metadata } from "next";
import Link from "next/link";
import RentVsBuyCalculator from "@/components/RentVsBuyCalculator";

export const metadata: Metadata = {
  title: "Rent vs. Buy Calculator — Recession Ready",
  description:
    "Compare buying a home with renting and investing the difference, including mortgage amortization, appreciation, carrying costs, and transaction costs.",
};

export default function RentVsBuyPage() {
  return (
    <>
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-cream/95 px-6 py-4 backdrop-blur md:px-8">
        <Link
          href="/"
          className="font-mono text-[13px] tracking-[0.05em] text-amber"
        >
          recession-ready.fyi
        </Link>
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint transition-colors hover:text-ink"
        >
          Take the readiness audit &rarr;
        </Link>
      </nav>

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-6 py-10 md:px-8 md:py-14">
        <header className="mb-10 max-w-[720px]">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.12em] text-amber">
            Housing decision tool
          </p>
          <h1 className="mb-5 font-serif text-[clamp(38px,6vw,58px)] font-normal leading-[1.08] text-ink">
            Should you <em className="italic text-amber">rent</em> or buy?
          </h1>
          <p className="max-w-[650px] text-base leading-[1.75] text-ink-muted">
            Compare ending net worth under two paths: buying a home, or renting
            an equivalent place and investing the cash you keep. Principal is
            treated as equity, while interest, upkeep, and transaction costs
            remain real expenses.
          </p>
        </header>

        <RentVsBuyCalculator />

        <section className="mt-12 border-t border-border pt-7 text-sm leading-relaxed text-ink-muted">
          <h2 className="mb-2 font-serif text-xl text-ink">What the model includes</h2>
          <p className="max-w-[780px]">
            The renter starts by investing the down payment and purchase closing
            costs they avoided. Each month, whichever path has the lower housing
            cash cost invests the difference. The buyer builds equity through
            principal repayment and appreciation, then pays selling costs at the
            selected horizon.
          </p>
          <p className="mt-3 max-w-[780px] text-xs text-ink-faint">
            This is a planning model, not tax, legal, or investment advice. It
            does not model itemized tax deductions, capital-gains taxes,
            refinancing, special assessments, or property-specific risks.
          </p>
        </section>
      </main>

      <footer className="mt-auto border-t border-border px-8 py-6 text-center font-mono text-xs text-ink-faint">
        Your inputs stay in your browser. No data collected or stored.
      </footer>
    </>
  );
}
