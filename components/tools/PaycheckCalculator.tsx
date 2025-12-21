"use client";

import { useMemo, useState } from "react";

type PayFrequency = "weekly" | "biweekly" | "semimonthly" | "monthly";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function PaycheckCalculator() {
  const [payFrequency, setPayFrequency] = useState<PayFrequency>("biweekly");
  const [grossPerPaycheck, setGrossPerPaycheck] = useState<number>(3000);

  // Effective combined rate estimate (simple & universal)
  const [effectiveTaxRate, setEffectiveTaxRate] = useState<number>(24);

  // Per-paycheck deductions (keeps this tool clean and actionable)
  const [deductionsPerPaycheck, setDeductionsPerPaycheck] = useState<number>(250);

  const r = useMemo(() => {
    const gross = Math.max(0, n(grossPerPaycheck));
    const taxRate = Math.min(100, Math.max(0, n(effectiveTaxRate))) / 100;
    const deductions = Math.max(0, n(deductionsPerPaycheck));

    const paychecksPerYear =
      payFrequency === "weekly" ? 52 :
      payFrequency === "biweekly" ? 26 :
      payFrequency === "semimonthly" ? 24 :
      12;

    const taxes = gross * taxRate;
    const net = Math.max(0, gross - taxes - deductions);

    const netAnnual = net * paychecksPerYear;
    const netMonthly = netAnnual / 12;

    return {
      payFrequency,
      paychecksPerYear,
      gross,
      taxRatePct: taxRate * 100,
      deductions,
      taxes,
      net,
      netAnnual,
      netMonthly,
    };
  }, [payFrequency, grossPerPaycheck, effectiveTaxRate, deductionsPerPaycheck]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
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
          <label className="block text-sm font-medium">Gross pay per paycheck ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={grossPerPaycheck}
            onChange={(e) => setGrossPerPaycheck(Number(e.target.value))}
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

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Deductions per paycheck ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={deductionsPerPaycheck}
            onChange={(e) => setDeductionsPerPaycheck(Number(e.target.value))}
          />
          <p className="text-xs opacity-70 mt-1">
            Examples: retirement contributions, insurance premiums, HSA/FSA, union dues, commuter benefits, etc.
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          This paycheck estimate uses an effective tax rate and per-paycheck deductions.
          Withholding on your pay stub may differ.
        </p>

        <p className="font-semibold">Estimated net paycheck: ${r.net.toFixed(2)}</p>
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
