"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function SemiMonthlyPaycheckCalculator() {
  const [grossPerPaycheck, setGrossPerPaycheck] = useState<number>(4000);
  const [effectiveTaxRate, setEffectiveTaxRate] = useState<number>(25);
  const [deductionsPerPaycheck, setDeductionsPerPaycheck] = useState<number>(300);

  const r = useMemo(() => {
    const gross = Math.max(0, n(grossPerPaycheck));
    const taxRate = Math.min(100, Math.max(0, n(effectiveTaxRate))) / 100;
    const deductions = Math.max(0, n(deductionsPerPaycheck));

    const paychecksPerYear = 24; // semi-monthly standard
    const taxes = gross * taxRate;
    const net = Math.max(0, gross - taxes - deductions);

    const netAnnual = net * paychecksPerYear;
    const netMonthly = netAnnual / 12;

    return {
      gross,
      taxRatePct: taxRate * 100,
      deductions,
      taxes,
      net,
      netAnnual,
      netMonthly,
      paychecksPerYear,
    };
  }, [grossPerPaycheck, effectiveTaxRate, deductionsPerPaycheck]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">
            Gross pay per semi-monthly paycheck ($)
          </label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={grossPerPaycheck}
            onChange={(e) => setGrossPerPaycheck(Number(e.target.value))}
          />
          <p className="text-xs opacity-70 mt-1">
            Semi-monthly pay means 24 paychecks per year (usually 1st & 15th or similar).
          </p>
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
          <label className="block text-sm font-medium">Deductions per paycheck ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={deductionsPerPaycheck}
            onChange={(e) => setDeductionsPerPaycheck(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          Estimate uses an effective tax rate and per-paycheck deductions. Actual withholding may differ.
        </p>

        <p className="font-semibold">Estimated net semi-monthly paycheck: ${r.net.toFixed(2)}</p>
        <p className="text-sm opacity-80">
          Net = Gross ${r.gross.toFixed(2)} − Taxes ${r.taxes.toFixed(2)} − Deductions ${r.deductions.toFixed(2)}
        </p>

        <div className="pt-2">
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
