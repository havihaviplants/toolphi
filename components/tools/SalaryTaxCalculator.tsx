"use client";

import { useMemo, useState } from "react";

type PayFrequency = "annual" | "monthly" | "biweekly" | "weekly";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function SalaryTaxCalculator() {
  const [payFrequency, setPayFrequency] = useState<PayFrequency>("annual");
  const [grossPayInput, setGrossPayInput] = useState<number>(100000);
  const [effectiveTaxRate, setEffectiveTaxRate] = useState<number>(24);

  const r = useMemo(() => {
    const grossInput = Math.max(0, n(grossPayInput));
    const taxRate = Math.min(100, Math.max(0, n(effectiveTaxRate))) / 100;

    const periodsPerYear =
      payFrequency === "annual" ? 1 :
      payFrequency === "monthly" ? 12 :
      payFrequency === "biweekly" ? 26 :
      52;

    const grossAnnual = grossInput * periodsPerYear;
    const taxAnnual = grossAnnual * taxRate;

    return {
      payFrequency,
      periodsPerYear,
      grossAnnual,
      taxAnnual,
      taxMonthly: taxAnnual / 12,
      taxBiweekly: taxAnnual / 26,
      taxWeekly: taxAnnual / 52,
      taxRatePct: taxRate * 100,
    };
  }, [payFrequency, grossPayInput, effectiveTaxRate]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Gross pay input type</label>
          <select className="input" value={payFrequency} onChange={(e) => setPayFrequency(e.target.value as PayFrequency)}>
            <option value="annual">Annual gross salary</option>
            <option value="monthly">Gross per month</option>
            <option value="biweekly">Gross per biweekly paycheck (26/year)</option>
            <option value="weekly">Gross per weekly paycheck (52/year)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">
            {payFrequency === "annual" ? "Gross annual salary ($/year)" :
             payFrequency === "monthly" ? "Gross pay per month ($)" :
             payFrequency === "biweekly" ? "Gross pay per biweekly paycheck ($)" :
             "Gross pay per week ($)"}
          </label>
          <input
            className="input"
            type="number"
            min={0}
            step="1"
            value={grossPayInput}
            onChange={(e) => setGrossPayInput(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Effective tax rate (%)</label>
          <input
            className="input"
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={effectiveTaxRate}
            onChange={(e) => setEffectiveTaxRate(Number(e.target.value))}
          />
          <p className="text-xs opacity-70 mt-1">
            Simplified estimate (federal + state + payroll combined).
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          Estimated salary tax using an effective rate. For exact withholding, use your pay stub or official calculator.
        </p>

        <p className="font-semibold">Estimated annual tax: ${r.taxAnnual.toFixed(0)}</p>
        <p className="text-sm opacity-80">
          Annual tax = Gross annual ${r.grossAnnual.toFixed(0)} × {r.taxRatePct.toFixed(2)}%
        </p>

        <div className="pt-2">
          <p>Monthly tax: ${r.taxMonthly.toFixed(2)}</p>
          <p>Biweekly tax: ${r.taxBiweekly.toFixed(2)}</p>
          <p>Weekly tax: ${r.taxWeekly.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
