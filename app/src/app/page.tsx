"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Hero from "@/components/Hero";
import History from "@/components/History";
import Quiz from "@/components/Quiz";
import Results from "@/components/Results";
import { calculateResults, encodeAnswers, decodeAnswers } from "@/lib/scoring";
import { generateRecommendations } from "@/lib/recommendations";

type Screen = "hero" | "history" | "quiz" | "results";

interface ResultsData {
  total: number;
  categories: ReturnType<typeof calculateResults>["categories"];
  grade: ReturnType<typeof calculateResults>["grade"];
  recommendations: string[];
  answers: Record<number, number>;
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("hero");
  const [results, setResults] = useState<ResultsData | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Restore from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("a=")) return;

    const match = hash.match(/a=([0-9,]+)/);
    if (!match) return;

    const answers = decodeAnswers(match[1]);
    if (!answers) return;

    const { total, categories, grade } = calculateResults(answers);
    const recommendations = generateRecommendations(answers, categories);
    setResults({ total, categories, grade, recommendations, answers });
    setScreen("results");
  }, []);

  const navigateTo = useCallback((target: Screen) => {
    setTransitioning(true);
    if (contentRef.current) {
      contentRef.current.style.transition = "opacity 0.15s ease";
      contentRef.current.style.opacity = "0";
    }

    setTimeout(() => {
      setScreen(target);
      window.scrollTo({ top: 0, behavior: "smooth" });

      requestAnimationFrame(() => {
        if (contentRef.current) {
          contentRef.current.style.transition = "opacity 0.25s ease";
          contentRef.current.style.opacity = "1";
        }
        setTransitioning(false);
      });
    }, 150);
  }, []);

  const handleStartQuiz = useCallback(() => {
    navigateTo("quiz");
  }, [navigateTo]);

  const handleShowHistory = useCallback(() => {
    navigateTo("history");
  }, [navigateTo]);

  const handleQuizComplete = useCallback(
    (answers: Record<number, number>) => {
      const { total, categories, grade } = calculateResults(answers);
      const recommendations = generateRecommendations(answers, categories);
      setResults({ total, categories, grade, recommendations, answers });

      const encoded = encodeAnswers(answers);
      history.replaceState(null, "", `#r=${total}&a=${encoded}`);

      navigateTo("results");
    },
    [navigateTo]
  );

  const handleRetake = useCallback(() => {
    setResults(null);
    history.replaceState(null, "", window.location.pathname);
    navigateTo("quiz");
  }, [navigateTo]);

  const handleShare = useCallback(() => {
    if (!results) return;

    const url = window.location.href;
    const text = `I scored ${results.total}/100 on the Recession Ready audit. ${results.grade.grade}. How prepared are you?`;

    if (navigator.share) {
      navigator.share({ title: "Recession Ready Score", text, url });
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2500);
      });
    }
  }, [results]);

  return (
    <>
      <nav className="border-b border-border px-6 md:px-8 py-4 flex items-center justify-between bg-cream sticky top-0 z-50">
        <button
          onClick={() => navigateTo("hero")}
          className="font-mono text-[13px] text-amber tracking-[0.05em] bg-transparent border-none cursor-pointer p-0"
        >
          recession-ready.fyi
        </button>
        <div className="flex items-center gap-4">
          <Link
            href="/stress-test"
            className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint transition-colors hover:text-ink"
          >
            Stress test
          </Link>
          <Link
            href="/runway"
            className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint transition-colors hover:text-ink"
          >
            Runway
          </Link>
          <Link
            href="/rent-vs-buy"
            className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint transition-colors hover:text-ink"
          >
            Rent vs. buy
          </Link>
          <span className="hidden text-xs text-ink-faint font-mono lg:inline">
            8 questions &middot; ~3 min
          </span>
        </div>
      </nav>

      <main className="max-w-[700px] mx-auto px-6">
        <div ref={contentRef}>
          {screen === "hero" && (
            <Hero
              onStartQuiz={handleStartQuiz}
              onShowHistory={handleShowHistory}
            />
          )}

          {screen === "history" && (
            <History onStartQuiz={handleStartQuiz} />
          )}

          {screen === "quiz" && <Quiz onComplete={handleQuizComplete} />}

          {screen === "results" && results && (
            <Results
              total={results.total}
              categories={results.categories}
              grade={results.grade}
              recommendations={results.recommendations}
              onRetake={handleRetake}
              onShowHistory={handleShowHistory}
              onShare={handleShare}
            />
          )}
        </div>
      </main>

      <footer className="border-t border-border py-6 px-8 text-center font-mono text-xs text-ink-faint mt-auto">
        Built from lessons learned the hard way, 1929–1939. &middot; No data
        collected or stored.
      </footer>

      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-ink text-cream px-5 py-2.5 rounded-md text-[13px] font-sans whitespace-nowrap transition-all duration-250 ${
          toastVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-5 pointer-events-none"
        }`}
      >
        Copied to clipboard
      </div>
    </>
  );
}
