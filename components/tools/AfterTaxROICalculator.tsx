"use client";

import { useMemo, useState } from "react";

export default function AfterTaxROICalculator() {
  const [investment, setInvestment] = useState<number>(10000);
  const [grossProfit, setGrossProfit] = useState<number>(1200);
  const [fees, setFees] = useState<number>(50);
  const [taxRate, setTaxRate] = useState<number>(15);

  const result = useMemo(() => {
    const inv = Math.max(0, investment);
    const profit = Math.max(0, grossProfit);
    const fee = Math.max(0, fees);
    const tax = Math.max(0, profit - fee) * (taxRate / 100);

    const netProfit = Math.max(profit - fee - tax, 0);
    const roi = inv > 0 ? (netProfit / inv) * 100 : 0;

    return { netProfit, roi };
  }, [investment, grossProfit, fees, taxRate]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Initial Investment ($)</label>
          <input
            className="input"
            type="number"
            value={investment}
            onChange={(e) => setInvestment(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Gross Profit ($)</label>
          <input
            className="input"
            type="number"
            value={grossProfit}
            onChange={(e) => setGrossProfit(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Fees ($)</label>
          <input
            className="input"
            type="number"
            value={fees}
            onChange={(e) => setFees(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Tax Rate (%)</label>
          <input
            className="input"
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <p className="font-semibold">
          After-Tax Net Profit: ${result.netProfit.toFixed(2)}
        </p>
        <p className="font-semibold">
          After-Tax ROI: {result.roi.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}
