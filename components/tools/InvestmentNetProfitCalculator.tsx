"use client";

import { useMemo, useState } from "react";

function safe(n: number) {
  return Number.isFinite(n) ? n : 0;
}

export default function InvestmentNetProfitCalculator() {
  const [purchasePrice, setPurchasePrice] = useState<number>(10000);
  const [sellingPrice, setSellingPrice] = useState<number>(12000);
  const [fees, setFees] = useState<number>(40);
  const [taxes, setTaxes] = useState<number>(180);

  const result = useMemo(() => {
    const buy = Math.max(0, safe(purchasePrice));
    const sell = Math.max(0, safe(sellingPrice));
    const fee = Math.max(0, safe(fees));
    const tax = Math.max(0, safe(taxes));

    const grossProfit = Math.max(sell - buy, 0);
    const netProfit = Math.max(grossProfit - fee - tax, 0);

    const netMargin = grossProfit > 0 ? (netProfit / grossProfit) * 100 : 0;

    return { grossProfit, netProfit, netMargin };
  }, [purchasePrice, sellingPrice, fees, taxes]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Purchase Price ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Selling Price ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(Number(e.target.value))}
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
          This calculator estimates net profit by subtracting fees and taxes from gross profit.
          Actual results may vary depending on tax rules and broker pricing.
        </p>

        <p className="font-semibold">Gross Profit: ${result.grossProfit.toFixed(2)}</p>
        <p className="font-semibold">Net Profit (after fees & taxes): ${result.netProfit.toFixed(2)}</p>
        <p className="font-semibold">Net Margin (vs gross profit): {result.netMargin.toFixed(2)}%</p>
      </div>
    </div>
  );
}
