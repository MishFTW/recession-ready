import { questions } from "./questions";

export interface CategoryResult {
  label: string;
  earned: number;
  max: number;
  pct: number;
}

export interface GradeTier {
  grade: string;
  subtitle: string;
  color: string;
  bg: string;
  summary: string;
}

export function calculateResults(answers: Record<number, number>): {
  total: number;
  categories: CategoryResult[];
  grade: GradeTier;
} {
  const categories: CategoryResult[] = questions.map((q, i) => {
    const earned =
      answers[i] !== undefined ? q.options[answers[i]].score : 0;
    return {
      label: q.label,
      earned,
      max: q.maxScore,
      pct: Math.round((earned / q.maxScore) * 100),
    };
  });

  const total = categories.reduce((sum, c) => sum + c.earned, 0);
  const grade = getGrade(total);

  return { total, categories, grade };
}

function getGrade(total: number): GradeTier {
  if (total >= 80) {
    return {
      grade: "Recession Ready",
      subtitle: "Bunker Built",
      color: "#1D6B4A",
      bg: "#EAF5EF",
      summary:
        "Your fundamentals are solid. You have the liquidity, flexibility, and skills to navigate a prolonged downturn without catastrophic loss. Your play now is staying opportunistic — people in your position buy generational assets when others are forced to sell.",
    };
  }
  if (total >= 60) {
    return {
      grade: "Cautiously Positioned",
      subtitle: "Storm Shelter",
      color: "#1A4D7C",
      bg: "#EAF1FA",
      summary:
        "You have real strengths but identifiable gaps. A moderate recession you'd weather — a decade-long depression would require deliberate adaptation. Start shoring up weak spots while conditions are still favorable.",
    };
  }
  if (total >= 40) {
    return {
      grade: "Moderate Exposure",
      subtitle: "Open Field",
      color: "#7A4E08",
      bg: "#F7EDDA",
      summary:
        "You're not immediately threatened, but you're not well-buffered either. A sustained downturn would be genuinely painful. Two or three structural changes now could meaningfully change your outcome.",
    };
  }
  if (total >= 20) {
    return {
      grade: "Vulnerable",
      subtitle: "Thin Ice",
      color: "#9B2B2B",
      bg: "#F9EDED",
      summary:
        "Significant exposure across multiple dimensions. A serious shock would hit fast and hard. Building cash and eliminating variable-rate debt is worth more right now than any investment return you're chasing.",
    };
  }
  return {
    grade: "Critical Risk",
    subtitle: "Exposed",
    color: "#9B2B2B",
    bg: "#F9EDED",
    summary:
      "You're carrying maximum exposure with minimal buffer. In a 1930s-scale event, the window before a life-disrupting crisis is very short. Aggressive de-risking is the only priority — everything else waits.",
  };
}

export function encodeAnswers(answers: Record<number, number>): string {
  const parts = questions.map((_, i) =>
    answers[i] !== undefined ? String(answers[i]) : ""
  );
  return parts.join(",");
}

export function decodeAnswers(encoded: string): Record<number, number> | null {
  const parts = encoded.split(",");
  if (parts.length !== questions.length) return null;

  const answers: Record<number, number> = {};
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === "") continue;
    const val = parseInt(parts[i], 10);
    if (isNaN(val) || val < 0 || val >= questions[i].options.length)
      return null;
    answers[i] = val;
  }

  if (Object.keys(answers).length !== questions.length) return null;
  return answers;
}
