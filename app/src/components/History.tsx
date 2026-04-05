"use client";

interface HistoryProps {
  onStartQuiz: () => void;
}

function CompareCard({
  title,
  color,
  items,
}: {
  title: string;
  color: string;
  items: string[];
}) {
  return (
    <div className="border border-border rounded-lg p-5 bg-white">
      <p
        className="font-mono text-[11px] uppercase tracking-[0.08em] mb-3 font-normal"
        style={{ color }}
      >
        {title}
      </p>
      <ul className="list-none text-[13.5px] text-ink-muted leading-8">
        {items.map((item) => (
          <li key={item} className="before:content-['—_']">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function History({ onStartQuiz }: HistoryProps) {
  return (
    <section className="py-12 md:py-16">
      <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-ink-faint mb-3">
        1929 – 1939
      </p>

      <h2 className="font-serif text-[32px] font-normal mb-3 leading-[1.2]">
        The crash that rewrote the rules
      </h2>

      <p className="text-[15px] text-ink-muted leading-[1.75] mb-7 max-w-[560px]">
        The Great Depression lasted a full decade. Unemployment peaked at 25%.
        GDP fell 30%. Nine thousand banks failed. What destroyed people
        wasn&apos;t the crash itself — it was what they were carrying going in,
        and how little flexibility they had to adapt.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <CompareCard
          title="What killed people financially"
          color="var(--color-red)"
          items={[
            "Margin debt wiped overnight",
            "Bank runs — no FDIC protection",
            "Fixed mortgage debt in deflation",
            "One-skill workers, nowhere to go",
            "Zero safety net (no UI, no SNAP)",
            "Geographic isolation",
          ]}
        />
        <CompareCard
          title="What saved people"
          color="var(--color-green)"
          items={[
            "Zero debt going in",
            "Tangible skills (fix, farm, heal)",
            "Multiple small income streams",
            "Hard cash or gold",
            "Barter networks and community",
            "Willingness to relocate",
          ]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <CompareCard
          title="Today: structural differences"
          color="var(--color-blue)"
          items={[
            "FDIC protects up to $250k/account",
            "Fed can print (deflation less likely)",
            "Unemployment insurance exists",
            "Remote work = real geographic choice",
            "Gig economy as an income floor",
          ]}
        />
        <CompareCard
          title="Today: new vulnerabilities"
          color="var(--color-amber)"
          items={[
            "401k locked (10% early penalty)",
            "Digital bank runs happen in hours",
            "Consulting is cut first in downturns",
            "AI displacing knowledge workers",
            "Dollar devaluation risk abroad",
          ]}
        />
      </div>

      <div className="border-l-[3px] border-l-amber pl-5 pr-5 py-4 bg-amber-light rounded-r-md text-sm text-amber-dark leading-[1.7] my-6">
        A modern depression would likely look like 15–25% unemployment, equities
        down 60–70%, and a decade of stagnation. Not breadlines — a slow,
        grinding middle-class squeeze where the pain is invisible until it
        isn&apos;t.
      </div>

      <button
        onClick={onStartQuiz}
        className="px-6 py-2.5 bg-ink text-cream border-none rounded font-sans text-sm font-medium cursor-pointer transition-all duration-150 hover:bg-[#333] active:scale-[0.98]"
      >
        Start the audit &rarr;
      </button>
    </section>
  );
}
