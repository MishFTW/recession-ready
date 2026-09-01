"use client";

import { useMemo, useState } from "react";
import {
  calculateRentVsBuy,
  defaultRentVsBuyInputs,
  findBreakEvenYear,
  type RentVsBuyInputs,
} from "@/lib/rent-vs-buy";

type NumberInputKey = {
  [Key in keyof RentVsBuyInputs]: RentVsBuyInputs[Key] extends number
    ? Key
    : never;
}[keyof RentVsBuyInputs];

interface InputFieldProps {
  id: NumberInputKey;
  label: string;
  value: number;
  onChange: (key: NumberInputKey, value: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  help?: string;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatMoney(value: number) {
  return currencyFormatter.format(Math.round(value));
}

function InputField({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  min,
  max,
  step = 1,
  help,
}: InputFieldProps) {
  return (
    <label htmlFor={id} className="block min-w-0">
      <span className="mb-1.5 block text-[13px] font-medium text-ink-muted">
        {label}
      </span>
      <span className="flex items-center rounded border border-border bg-white/55 transition-colors focus-within:border-amber focus-within:ring-2 focus-within:ring-amber/10">
        {prefix ? (
          <span className="pl-3 text-sm text-ink-faint" aria-hidden="true">
            {prefix}
          </span>
        ) : null}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(id, Number(event.target.value))}
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[15px] text-ink outline-none"
        />
        {suffix ? (
          <span className="pr-3 text-xs text-ink-faint" aria-hidden="true">
            {suffix}
          </span>
        ) : null}
      </span>
      {help ? <span className="mt-1 block text-[11px] text-ink-faint">{help}</span> : null}
    </label>
  );
}

interface StatProps {
  label: string;
  value: string;
  detail?: string;
}

function Stat({ label, value, detail }: StatProps) {
  return (
    <div className="border-t border-border py-3 first:border-t-0 first:pt-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-4">
        <dt className="text-[13px] text-ink-muted">{label}</dt>
        <dd className="font-mono text-sm text-ink">{value}</dd>
      </div>
      {detail ? <p className="mt-1 text-right text-[11px] text-ink-faint">{detail}</p> : null}
    </div>
  );
}

export default function RentVsBuyCalculator() {
  const [inputs, setInputs] = useState<RentVsBuyInputs>(
    defaultRentVsBuyInputs,
  );

  const result = useMemo(() => calculateRentVsBuy(inputs), [inputs]);
  const breakEvenYear = useMemo(() => findBreakEvenYear(inputs), [inputs]);

  const updateNumber = (key: NumberInputKey, value: number) => {
    setInputs((current) => ({
      ...current,
      [key]: Number.isFinite(value) ? value : 0,
    }));
  };

  const difference = Math.abs(result.netWorthDifference);
  const isTie = difference < 1_000;
  const buyingWins = result.netWorthDifference > 0;
  const winnerLabel = isTie
    ? "It is effectively a tie"
    : buyingWins
      ? "Buying comes out ahead"
      : "Renting comes out ahead";
  const winnerDetail = isTie
    ? `The modeled difference after ${inputs.holdingYears} years is under $1,000.`
    : `${buyingWins ? "Buying" : "Renting and investing"} leads by ${formatMoney(difference)} after ${inputs.holdingYears} years.`;
  const largestNetWorth = Math.max(
    1,
    result.buyerNetWorth,
    result.renterNetWorth,
  );
  const buyerBarWidth = Math.max(
    0,
    Math.min(100, (result.buyerNetWorth / largestNetWorth) * 100),
  );
  const renterBarWidth = Math.max(
    0,
    Math.min(100, (result.renterNetWorth / largestNetWorth) * 100),
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-start">
      <section aria-labelledby="assumptions-heading" className="space-y-7">
        <div>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2
              id="assumptions-heading"
              className="font-serif text-2xl text-ink"
            >
              Your assumptions
            </h2>
            <button
              type="button"
              onClick={() => setInputs(defaultRentVsBuyInputs)}
              className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint transition-colors hover:text-amber"
            >
              Reset defaults
            </button>
          </div>

          <div className="grid gap-4 rounded-lg border border-border bg-white/30 p-5 sm:grid-cols-2">
            <InputField
              id="homePrice"
              label="Home price"
              value={inputs.homePrice}
              onChange={updateNumber}
              prefix="$"
              min={0}
              step={10_000}
            />
            <InputField
              id="monthlyRent"
              label="Equivalent monthly rent"
              value={inputs.monthlyRent}
              onChange={updateNumber}
              prefix="$"
              min={0}
              step={100}
            />
            <InputField
              id="downPaymentPercent"
              label="Down payment"
              value={inputs.downPaymentPercent}
              onChange={updateNumber}
              suffix="%"
              min={0}
              max={100}
            />
            <InputField
              id="mortgageRate"
              label="Mortgage rate"
              value={inputs.mortgageRate}
              onChange={updateNumber}
              suffix="%"
              min={0}
              step={0.05}
            />
            <InputField
              id="holdingYears"
              label="How long you will stay"
              value={inputs.holdingYears}
              onChange={updateNumber}
              suffix="years"
              min={1}
              max={40}
            />
            <label htmlFor="mortgageTermYears" className="block min-w-0">
              <span className="mb-1.5 block text-[13px] font-medium text-ink-muted">
                Mortgage term
              </span>
              <select
                id="mortgageTermYears"
                value={inputs.mortgageTermYears}
                onChange={(event) =>
                  updateNumber("mortgageTermYears", Number(event.target.value))
                }
                className="w-full rounded border border-border bg-white/55 px-3 py-2.5 text-[15px] text-ink outline-none transition-colors focus:border-amber focus:ring-2 focus:ring-amber/10"
              >
                <option value={30}>30 years</option>
                <option value={20}>20 years</option>
                <option value={15}>15 years</option>
              </select>
            </label>
          </div>
        </div>

        <details className="group rounded-lg border border-border bg-white/20">
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-medium text-ink marker:hidden">
            Advanced assumptions
            <span
              aria-hidden="true"
              className="font-mono text-ink-faint transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <div className="grid gap-4 border-t border-border p-5 sm:grid-cols-2">
            <InputField
              id="propertyTaxRate"
              label="Property tax"
              value={inputs.propertyTaxRate}
              onChange={updateNumber}
              suffix="% / yr"
              min={0}
              step={0.05}
            />
            <InputField
              id="annualInsurance"
              label="Home insurance"
              value={inputs.annualInsurance}
              onChange={updateNumber}
              prefix="$"
              suffix="/ yr"
              min={0}
              step={100}
            />
            <InputField
              id="monthlyHoa"
              label="HOA"
              value={inputs.monthlyHoa}
              onChange={updateNumber}
              prefix="$"
              suffix="/ mo"
              min={0}
              step={25}
            />
            <InputField
              id="maintenanceRate"
              label="Maintenance"
              value={inputs.maintenanceRate}
              onChange={updateNumber}
              suffix="% / yr"
              min={0}
              step={0.1}
            />
            <InputField
              id="monthlyPmi"
              label="PMI"
              value={inputs.monthlyPmi}
              onChange={updateNumber}
              prefix="$"
              suffix="/ mo"
              min={0}
              step={25}
              help="Automatically stops at 20% equity."
            />
            <InputField
              id="buyingClosingCostRate"
              label="Buying closing costs"
              value={inputs.buyingClosingCostRate}
              onChange={updateNumber}
              suffix="%"
              min={0}
              step={0.25}
            />
            <InputField
              id="sellingCostRate"
              label="Selling costs"
              value={inputs.sellingCostRate}
              onChange={updateNumber}
              suffix="%"
              min={0}
              step={0.25}
            />
            <InputField
              id="annualAppreciation"
              label="Home appreciation"
              value={inputs.annualAppreciation}
              onChange={updateNumber}
              suffix="% / yr"
              min={-20}
              step={0.1}
            />
            <InputField
              id="annualRentGrowth"
              label="Rent growth"
              value={inputs.annualRentGrowth}
              onChange={updateNumber}
              suffix="% / yr"
              min={-20}
              step={0.1}
            />
            <InputField
              id="annualInvestmentReturn"
              label="Investment return"
              value={inputs.annualInvestmentReturn}
              onChange={updateNumber}
              suffix="% / yr"
              min={-20}
              step={0.1}
            />
            <label className="flex items-start gap-3 sm:col-span-2">
              <input
                type="checkbox"
                checked={inputs.growOwnerCosts}
                onChange={(event) =>
                  setInputs((current) => ({
                    ...current,
                    growOwnerCosts: event.target.checked,
                  }))
                }
                className="mt-0.5 size-4 accent-amber"
              />
              <span>
                <span className="block text-[13px] font-medium text-ink-muted">
                  Grow taxes, insurance, HOA and maintenance over time
                </span>
                <span className="mt-0.5 block text-[11px] leading-relaxed text-ink-faint">
                  Property-based costs follow home value; insurance and HOA use
                  rent growth as a simple inflation proxy.
                </span>
              </span>
            </label>
          </div>
        </details>
      </section>

      <aside
        aria-live="polite"
        aria-labelledby="result-heading"
        className="rounded-lg border border-border bg-[#fffaf2] p-5 shadow-[0_18px_50px_rgba(63,45,18,0.08)] lg:sticky lg:top-24"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-amber">
          Modeled outcome
        </p>
        <h2 id="result-heading" className="mt-2 font-serif text-[28px] leading-tight text-ink">
          {winnerLabel}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          {winnerDetail}
        </p>

        <div className="my-6 space-y-4 border-y border-border py-5">
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-4 text-[12px]">
              <span className="text-ink-muted">Buy net worth</span>
              <span className="font-mono text-ink">{formatMoney(result.buyerNetWorth)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border/60">
              <div
                className="h-full rounded-full bg-amber transition-[width] duration-300"
                style={{ width: `${buyerBarWidth}%` }}
              />
            </div>
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-4 text-[12px]">
              <span className="text-ink-muted">Rent + invest net worth</span>
              <span className="font-mono text-ink">{formatMoney(result.renterNetWorth)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border/60">
              <div
                className="h-full rounded-full bg-blue transition-[width] duration-300"
                style={{ width: `${renterBarWidth}%` }}
              />
            </div>
          </div>
        </div>

        <dl>
          <Stat
            label="Break-even holding period"
            value={breakEvenYear ? `~${breakEvenYear} years` : "Beyond 40 years"}
          />
          <Stat
            label="Mortgage principal & interest"
            value={`${formatMoney(result.monthlyMortgage)} / mo`}
          />
          <Stat
            label="Owner cash cost, year one"
            value={`${formatMoney(result.ownerMonthlyCostYearOne)} / mo`}
            detail="Includes principal, tax, insurance, maintenance, HOA and PMI."
          />
          <Stat
            label="Projected home value"
            value={formatMoney(result.projectedHomeValue)}
          />
          <Stat
            label="Mortgage balance at sale"
            value={formatMoney(result.mortgageBalance)}
          />
          <Stat
            label="Net home sale proceeds"
            value={formatMoney(result.netSaleProceeds)}
            detail="After mortgage payoff and selling costs."
          />
          <Stat
            label="Price-to-rent ratio"
            value={
              result.priceToRentRatio
                ? `${result.priceToRentRatio.toFixed(1)}×`
                : "—"
            }
          />
        </dl>
      </aside>
    </div>
  );
}
