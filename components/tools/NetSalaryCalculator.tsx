"use client";

import { useMemo, useState } from "react";

type PayFrequency = "annual" | "monthly" | "biweekly" | "weekly";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function NetSalaryCalculator() {
  const [payFrequency, setPayFrequency] = useState<PayFrequency>("annual");
  const [grossPayInput, setGrossPayInput] = useState<number>(70000);

  const [effectiveTaxRate, setEffectiveTaxRate] = useState<number>(20);

  const [annualDeductions, setAnnualDeductions] = useState<number>(5000);

  const r = useMemo(() => {
    const grossInput = Math.max(0, n(grossPayInput));
    const taxRate = Math.min(100, Math.max(0, n(effectiveTaxRate))) / 100;
    const deductions = Math.max(0, n(annualDeductions));

    const periodsPerYear =
      payFrequency === "annual" ? 1 :
      payFrequency === "monthly" ? 12 :
      payFrequency === "biweekly" ? 26 :
      52;

    const grossAnnual = grossInput * periodsPerYear;
    const taxesAnnual = grossAnnual * taxRate;
    const netAnnual = Math.max(0, grossAnnual - taxesAnnual - deductions);

    return {
      payFrequency,
      periodsPerYear,
      grossAnnual,
      taxesAnnual,
      deductions,
      netAnnual,
      netMonthly: netAnnual / 12,
      netBiweekly: netAnnual / 26,
      netWeekly: netAnnual / 52,
      taxRatePct: taxRate * 100,
    };
  }, [payFrequency, grossPayInput, effectiveTaxRate, annualDeductions]);

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
            This is a simplified estimate (federal + state + payroll combined).
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Annual deductions ($/year)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="1"
            value={annualDeductions}
            onChange={(e) => setAnnualDeductions(Number(e.target.value))}
          />
          <p className="text-xs opacity-70 mt-1">
            Examples: 401(k), insurance premiums, HSA/FSA, union dues, commuter benefits, etc.
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          Net salary estimate using an effective tax rate and annual deductions. For exact numbers, refer to your pay stub.
        </p>

        <p className="font-semibold">Net annual (take-home): ${r.netAnnual.toFixed(0)}</p>
        <p className="text-sm opacity-80">
          Gross annual ${r.grossAnnual.toFixed(0)} − Taxes ${r.taxesAnnual.toFixed(0)} − Deductions ${r.deductions.toFixed(0)}
        </p>

        <div className="pt-2">
          <p>Net monthly: ${r.netMonthly.toFixed(2)}</p>
          <p>Net biweekly: ${r.netBiweekly.toFixed(2)}</p>
          <p>Net weekly: ${r.netWeekly.toFixed(2)}</p>
        </div>

        <p className="text-xs opacity-70 pt-2">
          Taxes shown here use an effective tax rate of {r.taxRatePct.toFixed(2)}%.
        </p>
      </div>
    </div>
  );
}
