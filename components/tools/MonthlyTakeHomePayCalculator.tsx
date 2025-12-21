"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function MonthlyTakeHomePayCalculator() {
  const [annualSalary, setAnnualSalary] = useState<number>(72000);
  const [effectiveTaxRate, setEffectiveTaxRate] = useState<number>(22);
  const [annualDeductions, setAnnualDeductions] = useState<number>(3600);

  const r = useMemo(() => {
    const salary = Math.max(0, n(annualSalary));
    const taxRate = Math.min(100, Math.max(0, n(effectiveTaxRate))) / 100;
    const deductions = Math.max(0, n(annualDeductions));

    const taxesAnnual = salary * taxRate;
    const netAnnual = Math.max(0, salary - taxesAnnual - deductions);
    const netMonthly = netAnnual / 12;

    return {
      salary,
      taxesAnnual,
      deductions,
      netAnnual,
      netMonthly,
      taxRatePct: taxRate * 100,
    };
  }, [annualSalary, effectiveTaxRate, annualDeductions]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium">Annual gross salary ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            value={annualSalary}
            onChange={(e) => setAnnualSalary(Number(e.target.value))}
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
        </div>

        <div>
          <label className="block text-sm font-medium">Annual deductions ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            value={annualDeductions}
            onChange={(e) => setAnnualDeductions(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          Monthly take-home pay estimate using an effective tax rate.
        </p>

        <p className="font-semibold">Monthly take-home pay: ${r.netMonthly.toFixed(2)}</p>
        <p className="text-sm opacity-80">
          Annual net ${r.netAnnual.toFixed(0)} ÷ 12
        </p>

        <p className="text-xs opacity-70">
          Tax rate applied: {r.taxRatePct.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}
