"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function SalaryAfterDeductionsCalculator() {
  const [grossAnnualSalary, setGrossAnnualSalary] = useState<number>(85000);

  const [retirementAnnual, setRetirementAnnual] = useState<number>(0);
  const [insuranceAnnual, setInsuranceAnnual] = useState<number>(0);
  const [otherAnnual, setOtherAnnual] = useState<number>(7500);

  // Optional: take-home estimate (keeps this tool distinct from "after-tax salary")
  const [applyTax, setApplyTax] = useState<boolean>(true);
  const [effectiveTaxRate, setEffectiveTaxRate] = useState<number>(22);

  const r = useMemo(() => {
    const gross = Math.max(0, n(grossAnnualSalary));
    const retirement = Math.max(0, n(retirementAnnual));
    const insurance = Math.max(0, n(insuranceAnnual));
    const other = Math.max(0, n(otherAnnual));
    const deductions = retirement + insurance + other;

    const afterDeductions = Math.max(0, gross - deductions);

    const taxRate = Math.min(100, Math.max(0, n(effectiveTaxRate))) / 100;
    const takeHomeAnnual = applyTax ? afterDeductions * (1 - taxRate) : afterDeductions;

    return {
      gross,
      deductions,
      afterDeductions,
      retirement,
      insurance,
      other,
      applyTax,
      taxRatePct: taxRate * 100,
      takeHomeAnnual,
      takeHomeMonthly: takeHomeAnnual / 12,
    };
  }, [
    grossAnnualSalary,
    retirementAnnual,
    insuranceAnnual,
    otherAnnual,
    applyTax,
    effectiveTaxRate,
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Gross annual salary ($/year)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="1"
            value={grossAnnualSalary}
            onChange={(e) => setGrossAnnualSalary(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Retirement deductions ($/year)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="1"
            value={retirementAnnual}
            onChange={(e) => setRetirementAnnual(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Insurance deductions ($/year)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="1"
            value={insuranceAnnual}
            onChange={(e) => setInsuranceAnnual(Number(e.target.value))}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Other deductions ($/year)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="1"
            value={otherAnnual}
            onChange={(e) => setOtherAnnual(Number(e.target.value))}
          />
        </div>

        <div className="sm:col-span-2 flex items-center gap-2">
          <input
            id="applyTax"
            type="checkbox"
            checked={applyTax}
            onChange={(e) => setApplyTax(e.target.checked)}
          />
          <label htmlFor="applyTax" className="text-sm">
            Apply effective tax rate to estimate take-home pay
          </label>
        </div>

        {applyTax && (
          <div className="sm:col-span-2">
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
              Optional estimate. If you only want “after deductions” (pre-tax), turn this off.
            </p>
          </div>
        )}
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          This calculator focuses on deductions (benefits/retirement/other). Taxes are optional for a take-home estimate.
        </p>

        <p className="font-semibold">After deductions (pre-tax): ${r.afterDeductions.toFixed(0)}</p>
        <p className="text-sm opacity-80">
          Gross ${r.gross.toFixed(0)} − Deductions ${r.deductions.toFixed(0)} = ${r.afterDeductions.toFixed(0)}
        </p>

        <div className="pt-2">
          <p className="font-semibold">
            {r.applyTax ? "Estimated take-home (after tax):" : "Net after deductions:"} ${r.takeHomeAnnual.toFixed(0)} / year
          </p>
          <p>Monthly: ${r.takeHomeMonthly.toFixed(2)}</p>
        </div>

        {r.applyTax && (
          <p className="text-xs opacity-70 pt-2">
            Tax rate applied: {r.taxRatePct.toFixed(2)}%
          </p>
        )}
      </div>
    </div>
  );
}
