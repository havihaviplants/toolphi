"use client";

import { useMemo, useState } from "react";

type PayFrequency = "annual" | "monthly" | "biweekly" | "weekly";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function AfterTaxSalaryCalculator() {
  const [payFrequency, setPayFrequency] = useState<PayFrequency>("annual");
  const [grossPayInput, setGrossPayInput] = useState<number>(90000);

  const [effectiveTaxRate, setEffectiveTaxRate] = useState<number>(25);

  const r = useMemo(() => {
    const grossInput = Math.max(0, n(grossPayInput));
    const taxRate = Math.min(100, Math.max(0, n(effectiveTaxRate))) / 100;

    const periodsPerYear =
      payFrequency === "annual" ? 1 :
      payFrequency === "monthly" ? 12 :
      payFrequency === "biweekly" ? 26 :
      52;

    const grossAnnual = grossInput * periodsPerYear;

    const afterTaxAnnual = grossAnnual * (1 - taxRate);

    return {
      payFrequency,
      periodsPerYear,
      grossAnnual,
      taxRatePct: taxRate * 100,
      afterTaxAnnual,
      afterTaxMonthly: afterTaxAnnual / 12,
      afterTaxBiweekly: afterTaxAnnual / 26,
      afterTaxWeekly: afterTaxAnnual / 52,
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
            Use a combined effective rate estimate (federal + state + payroll).
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          This tool estimates after-tax salary using an effective tax rate. It does not include deductions (401k, insurance, etc.).
        </p>

        <p className="font-semibold">After-tax annual: ${r.afterTaxAnnual.toFixed(0)}</p>
        <p className="text-sm opacity-80">
          After-tax annual = Gross annual ${r.grossAnnual.toFixed(0)} × (1 − {r.taxRatePct.toFixed(2)}%)
        </p>

        <div className="pt-2">
          <p>After-tax monthly: ${r.afterTaxMonthly.toFixed(2)}</p>
          <p>After-tax biweekly: ${r.afterTaxBiweekly.toFixed(2)}</p>
          <p>After-tax weekly: ${r.afterTaxWeekly.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
