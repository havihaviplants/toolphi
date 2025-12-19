"use client";

import { useMemo, useState } from "react";

function safe(n: number) {
  return Number.isFinite(n) ? n : 0;
}

export default function NetInvestmentReturnCalculator() {
  const [initialInvestment, setInitialInvestment] = useState<number>(10000);
  const [endingValue, setEndingValue] = useState<number>(11200);
  const [fees, setFees] = useState<number>(50);
  const [taxes, setTaxes] = useState<number>(120);

  const result = useMemo(() => {
    const initial = Math.max(0, safe(initialInvestment));
    const end = Math.max(0, safe(endingValue));
    const fee = Math.max(0, safe(fees));
    const tax = Math.max(0, safe(taxes));

    const grossProfit = Math.max(end - initial, 0);
    const netProfit = Math.max(grossProfit - fee - tax, 0);
    const netReturnPct = initial > 0 ? (netProfit / initial) * 100 : 0;

    return { grossProfit, netProfit, netReturnPct };
  }, [initialInvestment, endingValue, fees, taxes]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Initial Investment ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={initialInvestment}
            onChange={(e) => setInitialInvestment(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Ending Value ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={endingValue}
            onChange={(e) => setEndingValue(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Total Fees ($) (optional)</label>
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
          <label className="block text-sm font-medium">Total Taxes ($) (optional)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={taxes}
            onChange={(e) => setTaxes(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          This is a simplified estimate. Taxes and fees vary by jurisdiction, account type, and asset type.
        </p>

        <p className="font-semibold">Gross Profit: ${result.grossProfit.toFixed(2)}</p>
        <p className="font-semibold">Net Profit (after fees & taxes): ${result.netProfit.toFixed(2)}</p>
        <p className="font-semibold">Net Return: {result.netReturnPct.toFixed(2)}%</p>
      </div>
    </div>
  );
}
