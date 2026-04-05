"use client";

import { useEffect, useState, useRef } from "react";
import type { CategoryResult, GradeTier } from "@/lib/scoring";

interface ResultsProps {
  total: number;
  categories: CategoryResult[];
  grade: GradeTier;
  recommendations: string[];
  onRetake: () => void;
  onShowHistory: () => void;
  onShare: () => void;
}

function useCountUp(target: number, duration: number = 1200) {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    setValue(0);
    startTime.current = null;

    const animate = (timestamp: number) => {
      if (startTime.current === null) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const timer = setTimeout(() => requestAnimationFrame(animate), 300);
    return () => clearTimeout(timer);
  }, [target, duration]);

  return value;
}

function CategoryBar({
  category,
  index,
}: {
  category: CategoryResult;
  index: number;
}) {
  const [visible, setVisible] = useState(false);
  const color =
    category.pct >= 70 ? "#1D6B4A" : category.pct >= 40 ? "#7A4E08" : "#9B2B2B";

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 400 + index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div className="bg-white border border-border rounded-lg p-3.5">
      <div className="text-[11px] uppercase tracking-[0.06em] text-ink-faint font-mono mb-1">
        {category.label}
      </div>
      <div className="text-lg font-medium mb-1.5" style={{ color }}>
        {category.earned}
        <span className="text-[13px] font-normal text-ink-faint">
          {" "}
          / {category.max}
        </span>
      </div>
      <div className="bg-border h-[3px] rounded-full">
        <div
          className="h-[3px] rounded-full transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            width: visible ? `${category.pct}%` : "0%",
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

export default function Results({
  total,
  categories,
  grade,
  recommendations,
  onRetake,
  onShowHistory,
  onShare,
}: ResultsProps) {
  const displayScore = useCountUp(total);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-12 md:py-16">
      {/* Score hero */}
      <div className="text-center pb-6 border-b border-border mb-8">
        <div
          className="font-serif text-[60px] md:text-[80px] font-normal leading-none mb-1 transition-colors duration-500"
          style={{ color: grade.color }}
        >
          {displayScore}
        </div>
        <div className="font-mono text-xs text-ink-faint tracking-[0.08em] uppercase mb-4">
          out of 100
        </div>
        <div>
          <span
            className="inline-block px-4.5 py-1.5 rounded-full text-[13px] font-medium tracking-[0.02em] mb-1"
            style={{ background: grade.bg, color: grade.color }}
          >
            {grade.grade}
          </span>
          <span className="block font-mono text-[11px] text-ink-faint tracking-[0.08em] uppercase mt-1">
            {grade.subtitle}
          </span>
        </div>
        <p
          className={`text-[15px] text-ink-muted leading-[1.7] max-w-[480px] mx-auto mt-4 transition-opacity duration-500 ${
            showContent ? "opacity-100" : "opacity-0"
          }`}
        >
          {grade.summary}
        </p>
      </div>

      {/* Breakdown */}
      <div
        className={`transition-all duration-500 ${
          showContent
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint mb-3">
          Score breakdown
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
          {categories.map((cat, i) => (
            <CategoryBar key={cat.label} category={cat} index={i} />
          ))}
        </div>

        {/* Recommendations */}
        <div className="border border-border rounded-lg bg-white p-5 md:p-6 mb-6">
          <h3 className="font-serif text-xl font-normal mb-4">
            Your 90-day playbook
          </h3>
          <div>
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="text-sm text-ink-muted leading-[1.65] py-2 pl-5 border-b border-border last:border-b-0 relative"
              >
                <span className="absolute left-0 text-amber text-sm">
                  &rarr;
                </span>
                {rec}
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex gap-2.5 flex-wrap pt-4 border-t border-border">
          <button
            onClick={onShare}
            className="px-6 py-2.5 bg-ink text-cream border-none rounded font-sans text-sm font-medium cursor-pointer transition-all duration-150 hover:bg-[#333] active:scale-[0.98]"
          >
            Share your score
          </button>
          <button
            onClick={onRetake}
            className="px-5.5 py-2.5 bg-transparent text-ink border border-border rounded font-sans text-sm cursor-pointer transition-all duration-150 hover:border-ink-muted hover:bg-ink/[0.04]"
          >
            Retake the audit
          </button>
          <button
            onClick={onShowHistory}
            className="px-5.5 py-2.5 bg-transparent text-ink border border-border rounded font-sans text-sm cursor-pointer transition-all duration-150 hover:border-ink-muted hover:bg-ink/[0.04]"
          >
            Review history
          </button>
        </div>
      </div>
    </section>
  );
}
