import type { CategoryResult } from "./scoring";

export function generateRecommendations(
  answers: Record<number, number>,
  categories: CategoryResult[]
): string[] {
  const recs: string[] = [];

  // Liquid runway
  if (categories[1].pct < 60) {
    if (answers[1] === 0) {
      recs.push(
        "Month 1: Open a high-yield savings account (Marcus, Ally, Wealthfront Cash) and set a standing auto-transfer. Even $300/mo builds a 1-month buffer in under a year."
      );
    } else {
      recs.push(
        "Months 1–3: Make extending your liquid runway your single financial priority. Target 6 months minimum. Pause discretionary investing until you hit that floor — the protection is worth more than the returns."
      );
    }
  }

  // Debt
  if (categories[2].pct < 60) {
    if (answers[2] === 4) {
      recs.push(
        "Immediately: Attack the highest-rate debt with everything you have. A 20% APR credit card is a guaranteed -20% return on capital. Every dollar paid off is a recession-proof return."
      );
    } else {
      recs.push(
        "Month 1–2: Map every fixed payment obligation and calculate your true monthly floor. Then work to reduce it. In a downturn, every fixed payment tightens its grip as income shrinks."
      );
    }
  }

  // Income structure
  if (categories[3].pct < 60) {
    if (answers[3] === 3) {
      recs.push(
        "Month 2–3: Your field is discretionary — you'll be on the cut list early. Start building one freelance or consulting income stream now, even at $500–1,000/mo. That's your lifeline when the primary check stops."
      );
    } else if (answers[3] === 4) {
      recs.push(
        "Immediate: Being unemployed entering a downturn is maximum exposure. Take any stable contract or employment to rebuild your buffer, even below your target rate. Optionality requires cash."
      );
    } else {
      recs.push(
        "Month 2–3: Identify one skill you can freelance or productize independently. The goal isn't replacing your income — it's creating a second on-ramp that doesn't depend on a single employer surviving."
      );
    }
  }

  // Industry resilience
  if (categories[4].pct < 50) {
    recs.push(
      "Month 2–3: Map the adjacencies from your current industry into more essential sectors. Your skills likely transfer further than you think — and repositioning is far easier before a downturn than during one."
    );
  }

  // Skill portability
  if (categories[5].pct < 60) {
    recs.push(
      "Months 2–3: Invest 3–4 hours/week developing a second adjacent skill. A professional who can do two related things is twice as hireable in a thin market — and commands better rates in any market."
    );
  }

  // Geographic flex
  if (categories[6].pct < 60) {
    recs.push(
      "Month 1: Research one geographic arbitrage destination now. Mexico City, Medell\u00edn, or Lisbon cut cost of living 50–60% while you bill clients in USD. Knowing your exit reduces panic when conditions deteriorate."
    );
  }

  // Dependents
  if (answers[0] !== undefined && answers[0] >= 2) {
    recs.push(
      "Ongoing: With dependents, your cash buffer target is higher than standard advice. Six months is the baseline, twelve is the real target. Every other financial goal is secondary to this."
    );
  }

  // Housing
  if (answers[7] === 3) {
    recs.push(
      "Month 1: Stress-test your housing position. Run the scenario where your income drops 50% — can you service the mortgage? If not, understand your exit options while the market is calm."
    );
  }

  // Strong position
  if (categories[1].pct >= 70 && categories[2].pct >= 70) {
    recs.push(
      "Months 2–3: Your liquidity and debt positions are strong. Start building a watchlist of distressed assets you'd want to acquire in a downturn. The people who bought in 1932–1933 created generational wealth."
    );
  }

  if (recs.length === 0) {
    recs.push(
      "Your fundamentals are solid across the board. Stay liquid, maintain your professional network, and position yourself to acquire assets opportunistically as others are forced to de-leverage."
    );
  }

  return recs.slice(0, 6);
}
