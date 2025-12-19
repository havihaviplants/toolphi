"use client";

import { useMemo, useState } from "react";

function safe(n: number) {
  return Number.isFinite(n) ? n : 0;
}

export default function NetInvestmentIncomeCalculator() {
  const [income, setIncome] = useState<number>(2000);
  const [fees, setFees] = useState<number>(25);
  const [taxRate, setTaxRate] = useState<number>(22);

  const result = useMemo(() => {
    const inc = Math.max(0, safe(income));
    const fee = Math.max(0, safe(fees));
    const rate = Math.max(0, safe(taxRate)) / 100;

    const taxableIncome = Math.max(inc - fee, 0);
    const tax = taxableIncome * rate;
    const netIncome = Math.max(taxableIncome - tax, 0);

    return { taxableIncome, tax, netIncome };
  }, [income, fees, taxRate]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Investment Income ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={income}
            onChange={(e) => setIncome(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Fees ($) (optional)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={fees}
            onChange={(e) => setFees(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Tax Rate (%)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          Simplified estimate. Actual investment income taxes vary by income type, jurisdiction, and account type.
        </p>

        <p className="font-semibold">Taxable Income: ${result.taxableIncome.toFixed(2)}</p>
        <p className="font-semibold">Estimated Tax: ${result.tax.toFixed(2)}</p>
        <p className="font-semibold">Net Investment Income: ${result.netIncome.toFixed(2)}</p>
      </div>
    </div>
  );
}
