"use client";

interface HeroProps {
  onStartQuiz: () => void;
  onShowHistory: () => void;
}

export default function Hero({ onStartQuiz, onShowHistory }: HeroProps) {
  return (
    <section className="py-12 md:py-16">
      <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-amber mb-5">
        Great Depression survival audit — 2025 edition
      </p>

      <h1 className="font-serif text-[clamp(38px,6vw,58px)] font-normal leading-[1.08] text-ink mb-5">
        Are you <em className="italic text-amber">recession</em>
        <br />
        ready?
      </h1>

      <p className="text-base text-ink-muted leading-[1.75] max-w-[520px] mb-8">
        A life audit built on hard lessons from the 1930s Great Depression.
        Enter your real situation — assets, debt, skills, flexibility — and get
        an honest score plus a personalized survival playbook.
      </p>

      <div className="flex gap-2.5 flex-wrap mb-10">
        <button
          onClick={onShowHistory}
          className="px-6 py-2.5 bg-ink text-cream border-none rounded font-sans text-sm font-medium cursor-pointer transition-all duration-150 hover:bg-[#333] active:scale-[0.98]"
        >
          Learn the history first &rarr;
        </button>
        <button
          onClick={onStartQuiz}
          className="px-5.5 py-2.5 bg-transparent text-ink border border-border rounded font-sans text-sm cursor-pointer transition-all duration-150 hover:border-ink-muted hover:bg-ink/[0.04]"
        >
          Skip straight to the audit
        </button>
      </div>

      <hr className="border-t border-border my-8" />

      <div className="flex gap-8">
        <div>
          <span className="font-serif text-[28px] text-ink block">8</span>
          <span className="text-xs text-ink-faint font-mono uppercase tracking-[0.06em]">
            Questions
          </span>
        </div>
        <div>
          <span className="font-serif text-[28px] text-ink block">~3</span>
          <span className="text-xs text-ink-faint font-mono uppercase tracking-[0.06em]">
            Minutes
          </span>
        </div>
        <div>
          <span className="font-serif text-[28px] text-ink block">0</span>
          <span className="text-xs text-ink-faint font-mono uppercase tracking-[0.06em]">
            Data stored
          </span>
        </div>
      </div>
    </section>
  );
}
