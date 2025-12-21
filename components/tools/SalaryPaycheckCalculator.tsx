"use client";

import { useMemo, useState } from "react";

type PayFrequency = "weekly" | "biweekly" | "semimonthly" | "monthly";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function SalaryPaycheckCalculator() {
  const [annualSalary, setAnnualSalary] = useState<number>(78000);
  const [payFrequency, setPayFrequency] = useState<PayFrequency>("biweekly");

  const [effectiveTaxRate, setEffectiveTaxRate] = useState<number>(22);
  const [annualDeductions, setAnnualDeductions] = useState<number>(3900);

  const r = useMemo(() => {
    const salary = Math.max(0, n(annualSalary));
    const taxRate = Math.min(100, Math.max(0, n(effectiveTaxRate))) / 100;
    const deductionsAnnual = Math.max(0, n(annualDeductions));

    const paychecksPerYear =
      payFrequency === "weekly" ? 52 :
      payFrequency === "biweekly" ? 26 :
      payFrequency === "semimonthly" ? 24 :
      12;

    const grossPerPaycheck = paychecksPerYear > 0 ? salary / paychecksPerYear : 0;
    const taxesPerPaycheck = grossPerPaycheck * taxRate;
    const deductionsPerPaycheck = paychecksPerYear > 0 ? deductionsAnnual / paychecksPerYear : 0;

    const netPerPaycheck = Math.max(0, grossPerPaycheck - taxesPerPaycheck - deductionsPerPaycheck);

    return {
      paychecksPerYear,
      salary,
      taxRatePct: taxRate * 100,
      deductionsAnnual,
      grossPerPaycheck,
      taxesPerPaycheck,
      deductionsPerPaycheck,
      netPerPaycheck,
      netMonthly: (netPerPaycheck * paychecksPerYear) / 12,
      netAnnual: netPerPaycheck * paychecksPerYear,
    };
  }, [annualSalary, payFrequency, effectiveTaxRate, annualDeductions]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Annual gross salary ($/year)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="1"
            value={annualSalary}
            onChange={(e) => setAnnualSalary(Number(e.target.value))}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Pay frequency</label>
          <select className="input" value={payFrequency} onChange={(e) => setPayFrequency(e.target.value as PayFrequency)}>
            <option value="weekly">Weekly (52/year)</option>
            <option value="biweekly">Biweekly (26/year)</option>
            <option value="semimonthly">Semi-monthly (24/year)</option>
            <option value="monthly">Monthly (12/year)</option>
          </select>
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
            Simplified combined estimate (federal + state + payroll).
          </p>
        </div>

        <div>
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
            Examples: retirement contributions, insurance, HSA/FSA, etc.
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          Converts annual salary into per-paycheck estimates. Withholding on your pay stub may differ.
        </p>

        <p className="font-semibold">Gross per paycheck: ${r.grossPerPaycheck.toFixed(2)}</p>
        <p>Estimated taxes per paycheck: ${r.taxesPerPaycheck.toFixed(2)}</p>
        <p>Deductions per paycheck: ${r.deductionsPerPaycheck.toFixed(2)}</p>

        <div className="pt-2">
          <p className="font-semibold">Estimated net paycheck: ${r.netPerPaycheck.toFixed(2)}</p>
          <p>Estimated net monthly: ${r.netMonthly.toFixed(2)}</p>
          <p>Estimated net annual: ${r.netAnnual.toFixed(2)}</p>
        </div>

        <p className="text-xs opacity-70 pt-2">
          Paychecks/year: {r.paychecksPerYear} · Tax rate: {r.taxRatePct.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}
