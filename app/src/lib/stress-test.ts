import recessionData from "@/data/recessions.json";

export interface Recession {
  id: string;
  name: string;
  years: string;
  durationMonths: number;
  baselineUnemployment: number;
  peakUnemployment: number;
  gdpDecline: number;
  marketDrawdown: number;
  marketRecoveryMonths: number;
  market: string;
  story: string;
}

export const recessions: Recession[] = recessionData.recessions;
export const recessionSourceNote: string = recessionData.sourceNote;

export interface StressTestInputs {
  portfolioValue: number;
  stockAllocationPercent: number;
  liquidSavings: number;
  monthlyEssentials: number;
}

export const defaultStressTestInputs: StressTestInputs = {
  portfolioValue: 250_000,
  stockAllocationPercent: 80,
  liquidSavings: 30_000,
  monthlyEssentials: 4_000,
};

export interface StressTestResult {
  stockValue: number;
  safeValue: number;
  portfolioAtTrough: number;
  portfolioLoss: number;
  portfolioLossPercent: number;
  recoveryYears: number;
  /** Months of essential spending covered by liquid savings; null when essentials are zero. */
  runwayMonths: number | null;
  /** Cash runway minus the recession's length, in months. Negative = came up short. */
  runwayVsDuration: number | null;
  /** "1 in N workers" at peak unemployment. */
  joblessOddsDenominator: number;
  unemploymentMultiple: number;
}

export function runStressTest(
  inputs: StressTestInputs,
  recession: Recession,
): StressTestResult {
  const portfolio = Math.max(0, inputs.portfolioValue);
  const allocation =
    Math.min(100, Math.max(0, inputs.stockAllocationPercent)) / 100;
  const stockValue = portfolio * allocation;
  const safeValue = portfolio - stockValue;

  const stockAtTrough = stockValue * (1 - recession.marketDrawdown / 100);
  const portfolioAtTrough = safeValue + stockAtTrough;
  const portfolioLoss = portfolio - portfolioAtTrough;

  const essentials = Math.max(0, inputs.monthlyEssentials);
  const runwayMonths =
    essentials > 0 ? Math.max(0, inputs.liquidSavings) / essentials : null;

  return {
    stockValue,
    safeValue,
    portfolioAtTrough,
    portfolioLoss,
    portfolioLossPercent: portfolio > 0 ? (portfolioLoss / portfolio) * 100 : 0,
    recoveryYears: recession.marketRecoveryMonths / 12,
    runwayMonths,
    runwayVsDuration:
      runwayMonths === null ? null : runwayMonths - recession.durationMonths,
    joblessOddsDenominator: Math.max(
      1,
      Math.round(100 / recession.peakUnemployment),
    ),
    unemploymentMultiple:
      recession.peakUnemployment / recession.baselineUnemployment,
  };
}
