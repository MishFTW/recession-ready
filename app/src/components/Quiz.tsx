"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { questions } from "@/lib/questions";

interface QuizProps {
  onComplete: (answers: Record<number, number>) => void;
}

export default function Quiz({ onComplete }: QuizProps) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [animating, setAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const q = questions[current];
  const totalQuestions = questions.length;
  const progress = ((current + (answers[current] !== undefined ? 1 : 0)) / totalQuestions) * 100;

  const animateTransition = useCallback(
    (dir: "forward" | "back", cb: () => void) => {
      setDirection(dir);
      setAnimating(true);

      // Start exit animation
      const el = containerRef.current;
      if (el) {
        el.style.transition = "opacity 0.15s ease, transform 0.15s ease";
        el.style.opacity = "0";
        el.style.transform =
          dir === "forward" ? "translateX(-20px)" : "translateX(20px)";
      }

      setTimeout(() => {
        cb();
        // Reset for enter animation
        if (el) {
          el.style.transition = "none";
          el.style.opacity = "0";
          el.style.transform =
            dir === "forward" ? "translateX(20px)" : "translateX(-20px)";
        }

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (el) {
              el.style.transition =
                "opacity 0.2s ease, transform 0.2s ease";
              el.style.opacity = "1";
              el.style.transform = "translateX(0)";
            }
            setTimeout(() => setAnimating(false), 200);
          });
        });
      }, 150);
    },
    []
  );

  const pick = useCallback(
    (optionIndex: number) => {
      setAnswers((prev) => ({ ...prev, [current]: optionIndex }));
    },
    [current]
  );

  const next = useCallback(() => {
    if (answers[current] === undefined || animating) return;

    if (current < totalQuestions - 1) {
      animateTransition("forward", () => setCurrent((c) => c + 1));
    } else {
      onComplete(answers);
    }
  }, [current, answers, totalQuestions, animating, animateTransition, onComplete]);

  const back = useCallback(() => {
    if (current <= 0 || animating) return;
    animateTransition("back", () => setCurrent((c) => c - 1));
  }, [current, animating, animateTransition]);

  // Auto-advance after selection (with a brief delay so user sees their pick)
  const prevAnswerRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    const currentAnswer = answers[current];
    // Only auto-advance if this is a new selection (not when navigating back to an already-answered question)
    if (
      currentAnswer !== undefined &&
      prevAnswerRef.current === undefined &&
      !animating
    ) {
      const timer = setTimeout(() => {
        if (current < totalQuestions - 1) {
          animateTransition("forward", () => setCurrent((c) => c + 1));
        }
      }, 350);
      return () => clearTimeout(timer);
    }
    prevAnswerRef.current = currentAnswer;
  }, [answers[current]]);

  // Reset prevAnswerRef when navigating
  useEffect(() => {
    prevAnswerRef.current = answers[current];
  }, [current]);

  return (
    <section className="py-12 md:py-16">
      {/* Progress bar */}
      <div className="h-[3px] bg-border rounded-full mb-8 overflow-hidden">
        <div
          className="h-[3px] bg-amber rounded-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div ref={containerRef}>
        <p className="font-mono text-[11px] text-ink-faint tracking-[0.08em] uppercase mb-2">
          Question {current + 1} of {totalQuestions}
        </p>

        <h2 className="font-serif text-[26px] font-normal leading-[1.3] mb-1.5">
          {q.title}
        </h2>

        <p className="text-sm text-ink-muted leading-[1.6] mb-6">{q.hint}</p>

        <div className="flex flex-col gap-2 mb-6">
          {q.options.map((opt, i) => {
            const isSelected = answers[current] === i;
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                className={`text-left px-4 py-3.5 rounded-md font-sans text-[14.5px] leading-[1.4] cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? "border-2 border-amber bg-amber-light text-amber-dark"
                    : "border border-border bg-white text-ink hover:border-ink-muted hover:bg-cream"
                }`}
              >
                {opt.text}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 items-center">
          {current > 0 && (
            <button
              onClick={back}
              className="px-5.5 py-2.5 bg-transparent text-ink border border-border rounded font-sans text-sm cursor-pointer transition-all duration-150 hover:border-ink-muted hover:bg-ink/[0.04]"
            >
              &larr; Back
            </button>
          )}
          <button
            onClick={next}
            disabled={answers[current] === undefined}
            className="px-6 py-2.5 bg-amber text-white border-none rounded font-sans text-sm font-medium cursor-pointer transition-colors duration-150 hover:bg-amber-dark disabled:opacity-40 disabled:cursor-default"
          >
            {current === totalQuestions - 1 ? "See my score \u2192" : "Next \u2192"}
          </button>
        </div>
      </div>
    </section>
  );
}
