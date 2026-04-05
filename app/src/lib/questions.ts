export interface Option {
  text: string;
  score: number;
}

export interface Question {
  title: string;
  hint: string;
  options: Option[];
  maxScore: number;
  label: string;
}

export const questions: Question[] = [
  {
    title: "Who depends on you?",
    hint: "Consider both financial and care responsibilities. Dependents reduce flexibility and raise the bar on everything else.",
    label: "Dependents",
    maxScore: 10,
    options: [
      { text: "Just me — no dependents", score: 10 },
      { text: "Me + a partner, no kids or elderly", score: 8 },
      { text: "Me + kids (any age)", score: 5 },
      { text: "Me + elderly parents or family members", score: 4 },
      { text: "Me + kids and elderly dependents", score: 2 },
    ],
  },
  {
    title: "How much liquid runway do you have?",
    hint: "Cash, HYSA, checking accounts — not retirement accounts. This is your actual survival buffer when income stops.",
    label: "Liquid runway",
    maxScore: 22,
    options: [
      { text: "Less than 1 month of expenses", score: 0 },
      { text: "1–2 months of expenses", score: 5 },
      { text: "3–5 months of expenses", score: 12 },
      { text: "6–11 months of expenses", score: 18 },
      { text: "12+ months of expenses", score: 22 },
    ],
  },
  {
    title: "What does your debt picture look like?",
    hint: "Fixed debt was the 1930s killer. People couldn't adapt because monthly payments kept coming regardless of income.",
    label: "Debt load",
    maxScore: 20,
    options: [
      { text: "Zero debt — completely clean", score: 20 },
      { text: "Credit cards only, manageable balance", score: 15 },
      { text: "Car loan or student loans", score: 10 },
      { text: "Mortgage with solid equity (30%+)", score: 8 },
      { text: "Multiple loans, or underwater on an asset", score: 2 },
    ],
  },
  {
    title: "How do you earn your income?",
    hint: "A single income source is a single point of failure. Multiple streams are the oldest financial survival mechanism.",
    label: "Income structure",
    maxScore: 15,
    options: [
      {
        text: "Multiple streams — freelance, investments, side businesses",
        score: 15,
      },
      { text: "Self-employed or consulting", score: 12 },
      { text: "Single employer in an essential industry", score: 10 },
      { text: "Single employer in a discretionary industry", score: 5 },
      { text: "Currently between gigs or unemployed", score: 0 },
    ],
  },
  {
    title: "What industry are you in?",
    hint: "Essential industries contracted last and recovered first in every historical downturn. Discretionary gets hit in the first 60 days.",
    label: "Industry resilience",
    maxScore: 10,
    options: [
      {
        text: "Healthcare, utilities, government, or food production",
        score: 10,
      },
      {
        text: "Transportation, logistics, agriculture, or skilled trades",
        score: 9,
      },
      { text: "Tech, finance, or professional services", score: 6 },
      {
        text: "Hospitality, retail, marketing, or entertainment",
        score: 2,
      },
    ],
  },
  {
    title: "How portable are your skills?",
    hint: "Can you earn money in a different city, country, or economic context using what's already in your head?",
    label: "Skill portability",
    maxScore: 10,
    options: [
      {
        text: "Trade skills — I can fix, build, or grow things people always need",
        score: 10,
      },
      {
        text: "Multiple transferable skills across fields or industries",
        score: 9,
      },
      {
        text: "One strong transferable skill (software, medicine, law)",
        score: 6,
      },
      { text: "Highly specialized in one non-essential niche", score: 3 },
      { text: "Mostly role-specific — hard to apply elsewhere", score: 1 },
    ],
  },
  {
    title: "Could you relocate to find opportunity?",
    hint: "Geographic arbitrage saved thousands in the 1930s. Those who could move to where jobs or low costs existed fared far better.",
    label: "Geographic flex",
    maxScore: 10,
    options: [
      {
        text: "Yes — I could move internationally if it came to it",
        score: 10,
      },
      {
        text: "Yes — I could relocate domestically without major issue",
        score: 7,
      },
      {
        text: "Possibly, but it would be difficult (family, lease, roots)",
        score: 4,
      },
      { text: "No — I am effectively tied to my current location", score: 1 },
    ],
  },
  {
    title: "What is your housing situation?",
    hint: "Renting is more flexible than people think. Underwater mortgages are lethal when asset prices fall 30–40% and income dries up.",
    label: "Housing security",
    maxScore: 3,
    options: [
      { text: "Own my home outright — no mortgage payment", score: 3 },
      { text: "Renting — flexible, can leave if needed", score: 2 },
      { text: "Mortgage with solid equity (30%+)", score: 2 },
      {
        text: "Mortgage with little equity or high payment-to-income ratio",
        score: 0,
      },
    ],
  },
];
