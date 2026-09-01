"use client";

import { useMemo, useState } from "react";
import { InputField, Stat, formatMoney } from "@/components/calculator-ui";
import {
  defaultStressTestInputs,
  recessions,
  recessionSourceNote,
  runStressTest,
  type StressTestInputs,
} from "@/lib/stress-test";

type NumberInputKey = keyof StressTestInputs;

function formatMonths(months: number) {
  const rounded = Math.round(months * 10) / 10;
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)} months`;
}

function formatRecovery(years: number) {
  if (years < 1) return `~${Math.round(years * 12)} months`;
  const rounded = Math.round(years * 10) / 10;
  return `~${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)} years`;
}

export default function StressTest() {
  const [inputs, setInputs] = useState<StressTestInputs>(
    defaultStressTestInputs,
  );
  const [recessionId, setRecessionId] = useState("great-recession");

  const recession =
    recessions.find((entry) => entry.id === recessionId) ?? recessions[0];
  const result = useMemo(
    () => runStressTest(inputs, recession),
    [inputs, recession],
  );

  const updateNumber = (key: NumberInputKey, value: number) => {
    setInputs((current) => ({
      ...current,
      [key]: Number.isFinite(value) ? value : 0,
    }));
  };

  const portfolioBefore = Math.max(0, inputs.portfolioValue);
  const largestBar = Math.max(1, portfolioBefore, result.portfolioAtTrough);
  const beforeBarWidth = (portfolioBefore / largestBar) * 100;
  const troughBarWidth = (result.portfolioAtTrough / largestBar) * 100;

  const runwayVerdict =
    result.runwayMonths === null
      ? "With no essential spending entered, your cash runway is effectively unlimited."
      : result.runwayVsDuration !== null && result.runwayVsDuration >= 0
        ? `Your cash covers ${formatMonths(result.runwayMonths)} of essentials — longer than the entire ${recession.durationMonths}-month downturn.`
        : `Your cash covers ${formatMonths(result.runwayMonths)} of essentials — this downturn lasted ${recession.durationMonths} months, leaving a ${formatMonths(Math.abs(result.runwayVsDuration ?? 0))} gap where you'd be selling assets at the bottom.`;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-start">
      <section aria-labelledby="scenario-heading" className="space-y-7">
        <div>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 id="scenario-heading" className="font-serif text-2xl text-ink">
              Your position
            </h2>
            <button
              type="button"
              onClick={() => setInputs(defaultStressTestInputs)}
              className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint transition-colors hover:text-amber"
            >
              Reset defaults
            </button>
          </div>

          <div className="grid gap-4 rounded-lg border border-border bg-white/30 p-5 sm:grid-cols-2">
            <InputField
              id="portfolioValue"
              label="Invested portfolio"
              value={inputs.portfolioValue}
              onChange={updateNumber}
              prefix="$"
              min={0}
              step={10_000}
              format="currency"
              sliderMin={0}
              sliderMax={2_000_000}
              help="Brokerage, 401(k), IRA — everything in markets."
            />
            <InputField
              id="stockAllocationPercent"
              label="Share in stocks"
              value={inputs.stockAllocationPercent}
              onChange={updateNumber}
              suffix="%"
              min={0}
              max={100}
              sliderMin={0}
              sliderMax={100}
              help="The rest is treated as holding its value."
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
              help="Cash you can reach without selling investments."
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
              help="Housing, food, insurance, minimum payments."
            />
          </div>
        </div>

        <div>
          <h2 className="mb-4 font-serif text-2xl text-ink">
            Pick your storm
          </h2>
          <div
            role="radiogroup"
            aria-label="Historical recession scenario"
            className="grid gap-2.5 sm:grid-cols-2"
          >
            {recessions.map((entry) => {
              const selected = entry.id === recession.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setRecessionId(entry.id)}
                  className={`rounded-lg border p-4 text-left transition-colors ${
                    selected
                      ? "border-amber bg-amber-light/60"
                      : "border-border bg-white/30 hover:border-amber/50"
                  }`}
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-[15px] font-medium text-ink">
                      {entry.name}
                    </span>
                    <span className="font-mono text-[11px] text-ink-faint">
                      {entry.years}
                    </span>
                  </span>
                  <span className="mt-1.5 block font-mono text-[11px] text-ink-muted">
                    stocks −{entry.marketDrawdown}% · unemployment{" "}
                    {entry.peakUnemployment}% · {entry.durationMonths} mo
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
            <span className="font-medium text-ink">{recession.name}.</span>{" "}
            {recession.story}
          </p>
        </div>
      </section>

      <aside
        aria-live="polite"
        aria-labelledby="stress-result-heading"
        className="rounded-lg border border-border bg-[#fffaf2] p-5 shadow-[0_18px_50px_rgba(63,45,18,0.08)] lg:sticky lg:top-24"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-amber">
          If {recession.years} happened again
        </p>
        <h2
          id="stress-result-heading"
          className="mt-2 font-serif text-[28px] leading-tight text-ink"
        >
          {formatMoney(portfolioBefore)} becomes{" "}
          {formatMoney(result.portfolioAtTrough)}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          At the bottom, your portfolio is down{" "}
          {formatMoney(result.portfolioLoss)} (
          {result.portfolioLossPercent.toFixed(0)}%), and the market took{" "}
          {formatRecovery(result.recoveryYears)} to fully recover.
        </p>

        <div className="my-6 space-y-4 border-y border-border py-5">
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-4 text-[12px]">
              <span className="text-ink-muted">Before the crash</span>
              <span className="font-mono text-ink">
                {formatMoney(portfolioBefore)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border/60">
              <div
                className="h-full rounded-full bg-blue transition-[width] duration-300"
                style={{ width: `${beforeBarWidth}%` }}
              />
            </div>
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-4 text-[12px]">
              <span className="text-ink-muted">At the trough</span>
              <span className="font-mono text-ink">
                {formatMoney(result.portfolioAtTrough)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border/60">
              <div
                className="h-full rounded-full bg-red transition-[width] duration-300"
                style={{ width: `${troughBarWidth}%` }}
              />
            </div>
          </div>
        </div>

        <dl>
          <Stat
            label="Market drawdown"
            value={`−${recession.marketDrawdown}%`}
            detail={recession.market}
          />
          <Stat
            label="Full market recovery"
            value={formatRecovery(result.recoveryYears)}
            detail="Peak back to peak, nominal terms."
          />
          <Stat
            label="Peak unemployment"
            value={`${recession.peakUnemployment}%`}
            detail={`About 1 in ${result.joblessOddsDenominator} workers — ${result.unemploymentMultiple.toFixed(1)}× the pre-recession rate.`}
          />
          <Stat
            label="Recession length"
            value={`${recession.durationMonths} months`}
          />
          <Stat
            label="Your cash runway"
            value={
              result.runwayMonths === null
                ? "—"
                : formatMonths(result.runwayMonths)
            }
          />
        </dl>

        <p className="mt-5 border-t border-border pt-4 text-[12px] leading-relaxed text-ink-muted">
          {runwayVerdict}
        </p>
        <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">
          {recessionSourceNote}
        </p>
      </aside>
    </div>
  );
}
