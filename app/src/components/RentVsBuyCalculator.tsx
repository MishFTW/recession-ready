"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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
  format?: "currency";
  sliderMin?: number;
  sliderMax?: number;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatMoney(value: number) {
  return currencyFormatter.format(Math.round(value));
}

type ZipEntry = [price: number, rent: number | null, place: string];

interface ZipMatch {
  price: number;
  rent: number | null;
  place: string;
  asOf: string;
}

type ZipLookupState =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "notFound" }
  | ({ state: "found"; detected?: boolean } & ZipMatch);

const zipShardCache = new Map<string, Promise<Record<string, ZipEntry>>>();
let zipMetaPromise: Promise<{ asOf: string }> | null = null;

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function lookupZip(zip: string): Promise<ZipMatch | null> {
  const shardKey = zip.slice(0, 2);
  if (!zipShardCache.has(shardKey)) {
    zipShardCache.set(
      shardKey,
      fetchJson<Record<string, ZipEntry>>(`/data/zip/${shardKey}.json`),
    );
  }
  zipMetaPromise ??= fetchJson<{ asOf: string }>("/data/zip/meta.json");

  let shard: Record<string, ZipEntry>;
  try {
    shard = await zipShardCache.get(shardKey)!;
  } catch {
    zipShardCache.delete(shardKey);
    return null;
  }

  let asOf = "";
  try {
    asOf = (await zipMetaPromise).asOf;
  } catch {
    zipMetaPromise = null;
  }

  const entry = shard[zip];
  if (!entry) return null;
  return { price: entry[0], rent: entry[1], place: entry[2], asOf };
}

function formatDataMonth(asOf: string) {
  const [year, month] = asOf.split("-").map(Number);
  if (!year || !month) return "";
  return new Date(Date.UTC(year, month - 1)).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
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
  format,
  sliderMin,
  sliderMax,
}: InputFieldProps) {
  const isCurrency = format === "currency";
  const hasSlider = sliderMin !== undefined && sliderMax !== undefined;
  const fillPercent = hasSlider
    ? Math.max(
        0,
        Math.min(100, ((value - sliderMin) / (sliderMax - sliderMin)) * 100),
      )
    : 0;

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
          type={isCurrency ? "text" : "number"}
          inputMode="decimal"
          value={isCurrency ? value.toLocaleString("en-US") : value}
          min={min}
          max={max}
          step={step}
          onChange={(event) =>
            onChange(
              id,
              isCurrency
                ? Number(event.target.value.replace(/[^0-9]/g, ""))
                : Number(event.target.value),
            )
          }
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[15px] text-ink outline-none"
        />
        {suffix ? (
          <span className="pr-3 text-xs text-ink-faint" aria-hidden="true">
            {suffix}
          </span>
        ) : null}
      </span>
      {hasSlider ? (
        <input
          type="range"
          aria-label={`${label} slider`}
          min={sliderMin}
          max={sliderMax}
          step={step}
          value={Math.max(sliderMin, Math.min(sliderMax, value))}
          onChange={(event) => onChange(id, Number(event.target.value))}
          className="whimsy-slider mt-2 w-full"
          style={{ "--fill": `${fillPercent}%` } as CSSProperties}
        />
      ) : null}
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

  const [zipCode, setZipCode] = useState("");
  const [zipLookup, setZipLookup] = useState<ZipLookupState>({ state: "idle" });
  const zipRequestRef = useRef(0);
  const userTouchedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/geo");
        if (!response.ok) return;
        const { zip } = (await response.json()) as { zip: string | null };
        if (cancelled || !zip || userTouchedRef.current) return;
        const match = await lookupZip(zip);
        if (cancelled || !match || userTouchedRef.current) return;
        setZipCode(zip);
        setInputs((current) => ({
          ...current,
          homePrice: match.price,
          ...(match.rent !== null ? { monthlyRent: match.rent } : {}),
        }));
        setZipLookup({ state: "found", detected: true, ...match });
      } catch {
        // Geo prefill is best-effort; the defaults stand.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleZipChange = (raw: string) => {
    userTouchedRef.current = true;
    const zip = raw.replace(/\D/g, "").slice(0, 5);
    setZipCode(zip);
    const requestId = ++zipRequestRef.current;
    if (zip.length < 5) {
      setZipLookup({ state: "idle" });
      return;
    }
    setZipLookup({ state: "loading" });
    lookupZip(zip)
      .then((match) => {
        if (zipRequestRef.current !== requestId) return;
        if (!match) {
          setZipLookup({ state: "notFound" });
          return;
        }
        setInputs((current) => ({
          ...current,
          homePrice: match.price,
          ...(match.rent !== null ? { monthlyRent: match.rent } : {}),
        }));
        setZipLookup({ state: "found", ...match });
      })
      .catch(() => {
        if (zipRequestRef.current === requestId) {
          setZipLookup({ state: "notFound" });
        }
      });
  };

  const zipMessage =
    zipLookup.state === "loading"
      ? "Looking up Zillow data…"
      : zipLookup.state === "notFound"
        ? "No Zillow data for that zip code — enter values manually."
        : zipLookup.state === "found"
          ? `${zipLookup.detected ? `Detected your area — using` : `Using`} ${zipLookup.place}: typical home ${formatMoney(zipLookup.price)}${
              zipLookup.rent !== null
                ? `, typical rent ${formatMoney(zipLookup.rent)}/mo`
                : " (no rent data for this zip)"
            } — Zillow, ${formatDataMonth(zipLookup.asOf)}.${
              zipLookup.detected ? " Not your area? Change the zip." : ""
            }`
          : "Sets home price and rent to the typical values for your area. Data © Zillow (ZHVI / ZORI).";

  const updateNumber = (key: NumberInputKey, value: number) => {
    userTouchedRef.current = true;
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

          <div className="mb-4 rounded-lg border border-border bg-white/30 p-5">
            <label htmlFor="zipCode" className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-ink-muted">
                Prefill from your zip code
              </span>
              <span className="flex max-w-[160px] items-center rounded border border-border bg-white/55 transition-colors focus-within:border-amber focus-within:ring-2 focus-within:ring-amber/10">
                <input
                  id="zipCode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="80202"
                  value={zipCode}
                  onChange={(event) => handleZipChange(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-[15px] text-ink outline-none"
                />
              </span>
            </label>
            <p className="mt-1.5 text-[11px] leading-relaxed text-ink-faint" aria-live="polite">
              {zipMessage}
            </p>
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
              format="currency"
              sliderMin={50_000}
              sliderMax={3_000_000}
            />
            <InputField
              id="monthlyRent"
              label="Equivalent monthly rent"
              value={inputs.monthlyRent}
              onChange={updateNumber}
              prefix="$"
              min={0}
              step={100}
              format="currency"
              sliderMin={500}
              sliderMax={15_000}
            />
            <InputField
              id="downPaymentPercent"
              label="Down payment"
              value={inputs.downPaymentPercent}
              onChange={updateNumber}
              suffix="%"
              min={0}
              max={100}
              sliderMin={0}
              sliderMax={100}
            />
            <InputField
              id="mortgageRate"
              label="Mortgage rate"
              value={inputs.mortgageRate}
              onChange={updateNumber}
              suffix="%"
              min={0}
              step={0.05}
              sliderMin={0}
              sliderMax={12}
            />
            <InputField
              id="holdingYears"
              label="How long you will stay"
              value={inputs.holdingYears}
              onChange={updateNumber}
              suffix="years"
              min={1}
              max={40}
              sliderMin={1}
              sliderMax={40}
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
              format="currency"
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
              format="currency"
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
              format="currency"
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
