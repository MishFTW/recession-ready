import stateData from "@/data/state-unemployment.json";

export interface StateBenefit {
  code: string;
  name: string;
  maxWeekly: number;
  maxWeeks: number;
}

export const stateBenefits: StateBenefit[] = stateData.states;
export const benefitsAsOf: string = stateData.asOf;
export const benefitsNote: string = stateData.note;

export function findState(code: string): StateBenefit | null {
  return stateBenefits.find((state) => state.code === code) ?? null;
}

export interface RunwayInputs {
  monthlyGrossIncome: number;
  monthlyEssentials: number;
  liquidSavings: number;
  severanceWeeks: number;
  stateCode: string;
}

export const defaultRunwayInputs: RunwayInputs = {
  monthlyGrossIncome: 8_000,
  monthlyEssentials: 4_500,
  liquidSavings: 25_000,
  severanceWeeks: 4,
  stateCode: "CA",
};

/** Months of runway shown as "capped" beyond this point. */
export const RUNWAY_CAP_MONTHS = 60;

const WEEKS_PER_MONTH = 52 / 12;

export interface RunwayResult {
  /** Estimated weekly unemployment benefit: ~50% of gross wages, capped by the state. */
  weeklyBenefit: number;
  benefitWeeks: number;
  benefitTotal: number;
  severancePay: number;
  /** Months covered by liquid savings alone; null when essentials are zero. */
  savingsOnlyMonths: number | null;
  withSeveranceMonths: number | null;
  /** Full runway with savings + severance + unemployment benefits. */
  totalRunwayMonths: number | null;
  monthsFromSeverance: number;
  monthsFromBenefits: number;
  /** True when runway exceeds RUNWAY_CAP_MONTHS (or essentials are zero). */
  isCapped: boolean;
}

/**
 * Simulates month-by-month cash after a layoff: liquid savings plus severance
 * up front, unemployment benefits arriving weekly until the state maximum runs
 * out, essential spending burning throughout. All amounts pre-tax.
 */
export function calculateRunway(
  inputs: RunwayInputs,
  state: StateBenefit | null = findState(inputs.stateCode),
): RunwayResult {
  const weeklyGross = (Math.max(0, inputs.monthlyGrossIncome) * 12) / 52;
  const weeklyBenefit = state
    ? Math.min(state.maxWeekly, weeklyGross * 0.5)
    : 0;
  const benefitWeeks = state ? state.maxWeeks : 0;
  const benefitTotal = weeklyBenefit * benefitWeeks;
  const severancePay = Math.max(0, inputs.severanceWeeks) * weeklyGross;

  const essentials = Math.max(0, inputs.monthlyEssentials);
  const savings = Math.max(0, inputs.liquidSavings);

  if (essentials <= 0) {
    return {
      weeklyBenefit,
      benefitWeeks,
      benefitTotal,
      severancePay,
      savingsOnlyMonths: null,
      withSeveranceMonths: null,
      totalRunwayMonths: null,
      monthsFromSeverance: 0,
      monthsFromBenefits: 0,
      isCapped: true,
    };
  }

  let cash = savings + severancePay;
  let remainingBenefitWeeks = benefitWeeks;
  let totalRunwayMonths: number | null = null;

  for (let month = 1; month <= RUNWAY_CAP_MONTHS; month += 1) {
    const benefitWeeksThisMonth = Math.min(
      WEEKS_PER_MONTH,
      remainingBenefitWeeks,
    );
    remainingBenefitWeeks -= benefitWeeksThisMonth;
    const netBurn = essentials - weeklyBenefit * benefitWeeksThisMonth;

    if (netBurn > 0 && cash < netBurn) {
      totalRunwayMonths = month - 1 + cash / netBurn;
      break;
    }
    cash -= netBurn;
  }

  const savingsOnlyMonths = savings / essentials;
  const withSeveranceMonths = (savings + severancePay) / essentials;
  const isCapped = totalRunwayMonths === null;
  const total = totalRunwayMonths ?? RUNWAY_CAP_MONTHS;

  return {
    weeklyBenefit,
    benefitWeeks,
    benefitTotal,
    severancePay,
    savingsOnlyMonths,
    withSeveranceMonths,
    totalRunwayMonths: total,
    monthsFromSeverance: Math.min(total, withSeveranceMonths) - Math.min(total, savingsOnlyMonths),
    monthsFromBenefits: total - Math.min(total, withSeveranceMonths),
    isCapped,
  };
}
