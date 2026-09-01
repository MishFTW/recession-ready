"use client";

import type { CSSProperties } from "react";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatMoney(value: number) {
  return currencyFormatter.format(Math.round(value));
}

interface InputFieldProps<Key extends string> {
  id: Key;
  label: string;
  value: number;
  onChange: (key: Key, value: number) => void;
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

export function InputField<Key extends string>({
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
}: InputFieldProps<Key>) {
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
      {help ? (
        <span className="mt-1 block text-[11px] text-ink-faint">{help}</span>
      ) : null}
    </label>
  );
}

interface StatProps {
  label: string;
  value: string;
  detail?: string;
}

export function Stat({ label, value, detail }: StatProps) {
  return (
    <div className="border-t border-border py-3 first:border-t-0 first:pt-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-4">
        <dt className="text-[13px] text-ink-muted">{label}</dt>
        <dd className="font-mono text-sm text-ink">{value}</dd>
      </div>
      {detail ? (
        <p className="mt-1 text-right text-[11px] text-ink-faint">{detail}</p>
      ) : null}
    </div>
  );
}
