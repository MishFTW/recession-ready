"use client";

import { useMemo, useState } from "react";
import { InputField, Stat, formatMoney } from "@/components/calculator-ui";
import {
  benefitsAsOf,
  benefitsNote,
  calculateRunway,
  defaultRunwayInputs,
  findState,
  stateBenefits,
  RUNWAY_CAP_MONTHS,
  type RunwayInputs,
} from "@/lib/runway";

type NumberInputKey = {
  [Key in keyof RunwayInputs]: RunwayInputs[Key] extends number ? Key : never;
}[keyof RunwayInputs];

const TARGET_MONTHS = 6;

function formatMonths(months: number) {
  const rounded = Math.round(months * 10) / 10;
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)} months`;
}

interface SegmentProps {
  label: string;
  months: number;
  colorClass: string;
}

export default function RunwayCalculator() {
  const [inputs, setInputs] = useState<RunwayInputs>(defaultRunwayInputs);

  const state = findState(inputs.stateCode);
  const result = useMemo(() => calculateRunway(inputs, state), [inputs, state]);

  const updateNumber = (key: NumberInputKey, value: number) => {
    setInputs((current) => ({
      ...current,
      [key]: Number.isFinite(value) ? value : 0,
    }));
  };

  const total = result.totalRunwayMonths;
  const savingsMonths =
    total === null ? 0 : Math.min(total, result.savingsOnlyMonths ?? 0);
  const segments: SegmentProps[] = [
    { label: "Savings", months: savingsMonths, colorClass: "bg-amber" },
    {
      label: "Severance",
      months: result.monthsFromSeverance,
      colorClass: "bg-blue",
    },
    {
      label: "Unemployment",
      months: result.monthsFromBenefits,
      colorClass: "bg-green",
    },
  ];
  const barScale = Math.max(total ?? 0, TARGET_MONTHS + 2);

  const headline =
    total === null
      ? "Indefinitely"
      : result.isCapped
        ? `${RUNWAY_CAP_MONTHS / 12}+ years`
        : formatMonths(total);

  const verdict =
    total === null
      ? "With no essential spending entered, the burn never starts."
      : total >= 12
        ? "More than a year of runway. That is real negotiating power — you can wait for the right job instead of taking the first one."
        : total >= TARGET_MONTHS
          ? "You clear the six-month bar. In the Great Recession, the median spell of unemployment stretched past six months — you could ride that out."
          : `You come up short of the six-month bar. In a bad recession, job searches routinely run six months or longer — closing the gap means roughly ${formatMoney(Math.max(0, (TARGET_MONTHS - total) * Math.max(0, inputs.monthlyEssentials)))} more in liquid savings, or a lower monthly burn.`;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-start">
      <section aria-labelledby="runway-inputs-heading" className="space-y-7">
        <div>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2
              id="runway-inputs-heading"
              className="font-serif text-2xl text-ink"
            >
              Your situation
            </h2>
            <button
              type="button"
              onClick={() => setInputs(defaultRunwayInputs)}
              className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint transition-colors hover:text-amber"
            >
              Reset defaults
            </button>
          </div>

          <div className="grid gap-4 rounded-lg border border-border bg-white/30 p-5 sm:grid-cols-2">
            <InputField
              id="monthlyGrossIncome"
              label="Monthly income, pre-tax"
              value={inputs.monthlyGrossIncome}
              onChange={updateNumber}
              prefix="$"
              suffix="/ mo"
              min={0}
              step={500}
              format="currency"
              sliderMin={2_000}
              sliderMax={30_000}
              help="Sets your severance value and benefit estimate."
            />
            <InputField
              id="monthlyEssentials"
              label="Monthly essentials"
              value={inputs.monthlyEssentials}
              onChange={updateNumber}
              prefix="$"
              suffix="/ mo"
              min={0}
              step={100}
              format="currency"
              sliderMin={1_000}
              sliderMax={15_000}
              help="Housing, food, insurance, minimum payments — the bare-bones burn."
            />
            <InputField
              id="liquidSavings"
              label="Liquid savings"
              value={inputs.liquidSavings}
              onChange={updateNumber}
              prefix="$"
              min={0}
              step={1_000}
              format="currency"
              sliderMin={0}
              sliderMax={200_000}
              help="Cash you can reach without penalties or selling at a loss."
            />
            <InputField
              id="severanceWeeks"
              label="Expected severance"
              value={inputs.severanceWeeks}
              onChange={updateNumber}
              suffix="weeks"
              min={0}
              max={52}
              sliderMin={0}
              sliderMax={26}
              help="A common formula is 1–2 weeks per year of tenure. Zero is safest to assume."
            />
            <label htmlFor="stateCode" className="block min-w-0 sm:col-span-2">
              <span className="mb-1.5 block text-[13px] font-medium text-ink-muted">
                Your state
              </span>
              <select
                id="stateCode"
                value={inputs.stateCode}
                onChange={(event) =>
                  setInputs((current) => ({
                    ...current,
                    stateCode: event.target.value,
                  }))
                }
                className="w-full rounded border border-border bg-white/55 px-3 py-2.5 text-[15px] text-ink outline-none transition-colors focus:border-amber focus:ring-2 focus:ring-amber/10"
              >
                {stateBenefits.map((entry) => (
                  <option key={entry.code} value={entry.code}>
                    {entry.name}
                  </option>
                ))}
              </select>
              {state ? (
                <span className="mt-1 block text-[11px] text-ink-faint">
                  {state.name} pays up to {formatMoney(state.maxWeekly)}/week
                  for up to {state.maxWeeks} weeks ({benefitsAsOf}).
                </span>
              ) : null}
            </label>
          </div>
        </div>
      </section>

      <aside
        aria-live="polite"
        aria-labelledby="runway-result-heading"
        className="rounded-lg border border-border bg-[#fffaf2] p-5 shadow-[0_18px_50px_rgba(63,45,18,0.08)] lg:sticky lg:top-24"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-amber">
          If your income stopped tomorrow
        </p>
        <h2
          id="runway-result-heading"
          className="mt-2 font-serif text-[28px] leading-tight text-ink"
        >
          You could last {headline}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{verdict}</p>

        <div className="my-6 border-y border-border py-5">
          <div className="relative">
            <div className="flex h-3 overflow-hidden rounded-full bg-border/60">
              {segments.map((segment) =>
                segment.months > 0.05 ? (
                  <div
                    key={segment.label}
                    className={`h-full ${segment.colorClass} transition-[width] duration-300`}
                    style={{ width: `${(segment.months / barScale) * 100}%` }}
                  />
                ) : null,
              )}
            </div>
            <div
              aria-hidden="true"
              className="absolute -top-1 bottom-[-4px] w-px bg-ink/50"
              style={{ left: `${(TARGET_MONTHS / barScale) * 100}%` }}
            />
            <span
              aria-hidden="true"
              className="absolute mt-1.5 -translate-x-1/2 font-mono text-[10px] text-ink-faint"
              style={{ left: `${(TARGET_MONTHS / barScale) * 100}%` }}
            >
              6 mo bar
            </span>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-4 gap-y-1">
            {segments.map((segment) => (
              <span
                key={segment.label}
                className="flex items-center gap-1.5 text-[11px] text-ink-muted"
              >
                <span
                  aria-hidden="true"
                  className={`size-2 rounded-full ${segment.colorClass}`}
                />
                {segment.label}
                <span className="font-mono text-ink-faint">
                  {segment.months > 0 ? `+${formatMonths(segment.months)}` : "—"}
                </span>
              </span>
            ))}
          </div>
        </div>

        <dl>
          <Stat
            label="Savings alone"
            value={
              result.savingsOnlyMonths === null
                ? "—"
                : formatMonths(result.savingsOnlyMonths)
            }
          />
          <Stat
            label="Severance value"
            value={formatMoney(result.severancePay)}
            detail={`${inputs.severanceWeeks} weeks at your current pay.`}
          />
          <Stat
            label="Est. weekly benefit"
            value={formatMoney(result.weeklyBenefit)}
            detail="Roughly half your weekly wage, capped by your state."
          />
          <Stat
            label="Benefit duration"
            value={`${result.benefitWeeks} weeks`}
            detail={`Worth ${formatMoney(result.benefitTotal)} in total.`}
          />
        </dl>

        <p className="mt-5 border-t border-border pt-4 text-[11px] leading-relaxed text-ink-faint">
          Estimates are pre-tax; severance and unemployment benefits are both
          taxable, and severance can delay benefit eligibility in some states.{" "}
          {benefitsNote}
        </p>
      </aside>
    </div>
  );
}
