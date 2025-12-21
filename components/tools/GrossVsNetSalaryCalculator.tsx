"use client";

import { useMemo, useState } from "react";

type PayFrequency = "annual" | "monthly" | "biweekly" | "weekly";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function GrossVsNetSalaryCalculator() {
  // Input mode: user can enter either annual gross or per-paycheck gross
  const [payFrequency, setPayFrequency] = useState<PayFrequency>("annual");
  const [grossPayInput, setGrossPayInput] = useState<number>(80000);

  // Simple effective tax rate (keeps it universal + fits search intent)
  const [effectiveTaxRate, setEffectiveTaxRate] = useState<number>(22);

  // Common deductions (can be estimated)
  const [retirement401kAnnual, setRetirement401kAnnual] = useState<number>(0);
  const [healthInsuranceAnnual, setHealthInsuranceAnnual] = useState<number>(0);
  const [otherDeductionsAnnual, setOtherDeductionsAnnual] = useState<number>(0);

  const r = useMemo(() => {
    const grossInput = Math.max(0, n(grossPayInput));
    const taxRate = Math.min(100, Math.max(0, n(effectiveTaxRate))) / 100;

    const annual401k = Math.max(0, n(retirement401kAnnual));
    const annualHealth = Math.max(0, n(healthInsuranceAnnual));
    const annualOther = Math.max(0, n(otherDeductionsAnnual));
    const annualDeductions = annual401k + annualHealth + annualOther;

    const periodsPerYear =
      payFrequency === "annual" ? 1 :
      payFrequency === "monthly" ? 12 :
      payFrequency === "biweekly" ? 26 :
      52;

    const grossAnnual = grossInput * periodsPerYear;
    const taxesAnnual = grossAnnual * taxRate;

    const netAnnual = Math.max(0, grossAnnual - taxesAnnual - annualDeductions);

    const netMonthly = netAnnual / 12;
    const netBiweekly = netAnnual / 26;
    const netWeekly = netAnnual / 52;

    return {
      payFrequency,
      periodsPerYear,
      grossAnnual,
      taxesAnnual,
      annualDeductions,
      netAnnual,
      netMonthly,
      netBiweekly,
      netWeekly,
      taxRatePct: taxRate * 100,
      annual401k,
      annualHealth,
      annualOther,
    };
  }, [
    payFrequency,
    grossPayInput,
    effectiveTaxRate,
    retirement401kAnnual,
    healthInsuranceAnnual,
    otherDeductionsAnnual,
  ]);

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
            Use your best estimate (federal + state + payroll combined).
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium">401(k) / retirement deductions ($/year)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="1"
            value={retirement401kAnnual}
            onChange={(e) => setRetirement401kAnnual(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Health insurance ($/year)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="1"
            value={healthInsuranceAnnual}
            onChange={(e) => setHealthInsuranceAnnual(Number(e.target.value))}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Other deductions ($/year)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="1"
            value={otherDeductionsAnnual}
            onChange={(e) => setOtherDeductionsAnnual(Number(e.target.value))}
          />
          <p className="text-xs opacity-70 mt-1">
            Examples: HSA/FSA, union dues, commuter benefits, garnishments, etc.
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          This is an estimate using an effective tax rate and annual deductions. Actual paycheck withholding can vary.
        </p>

        <p className="font-semibold">Gross annual: ${r.grossAnnual.toFixed(0)}</p>
        <p>Estimated taxes ({r.taxRatePct.toFixed(2)}%): ${r.taxesAnnual.toFixed(0)}</p>
        <p>Annual deductions: ${r.annualDeductions.toFixed(0)}</p>

        <div className="pt-2">
          <p className="font-semibold">Net (take-home) annual: ${r.netAnnual.toFixed(0)}</p>
          <p>Net monthly: ${r.netMonthly.toFixed(2)}</p>
          <p>Net biweekly: ${r.netBiweekly.toFixed(2)}</p>
          <p>Net weekly: ${r.netWeekly.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
