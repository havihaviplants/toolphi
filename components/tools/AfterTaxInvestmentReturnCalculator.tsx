"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function AfterTaxInvestmentReturnCalculator() {
  const [principal, setPrincipal] = useState<number>(10000);
  const [grossReturnRate, setGrossReturnRate] = useState<number>(8);
  const [feeRate, setFeeRate] = useState<number>(0.5);
  const [taxRate, setTaxRate] = useState<number>(15);

  const result = useMemo(() => {
    const P = Math.max(0, n(principal));
    const r = Math.max(0, n(grossReturnRate)) / 100;
    const f = Math.max(0, n(feeRate)) / 100;
    const t = Math.max(0, n(taxRate)) / 100;

    const grossProfit = P * r;
    const fees = P * f; // 단순화: 원금 기준 수수료(명시적으로 입력받는 구조)
    const taxableGain = Math.max(grossProfit - fees, 0);
    const tax = taxableGain * t;

    const netProfit = taxableGain - tax;
    const netReturnRate = P > 0 ? (netProfit / P) * 100 : 0;

    return {
      grossProfit,
      fees,
      taxableGain,
      tax,
      netProfit,
      netReturnRate
    };
  }, [principal, grossReturnRate, feeRate, taxRate]);

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
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Gross Return Rate (%)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={grossReturnRate}
            onChange={(e) => setGrossReturnRate(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Fee Rate (%) (optional)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={feeRate}
            onChange={(e) => setFeeRate(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Tax Rate on Gains (%)</label>
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
          This is a simplified estimate. Actual taxation and fees vary by jurisdiction, account type,
          asset type, and broker pricing.
        </p>

        <p className="font-semibold">Gross Profit: ${result.grossProfit.toFixed(2)}</p>
        <p className="font-semibold">Fees: ${result.fees.toFixed(2)}</p>
        <p className="font-semibold">Taxable Gain: ${result.taxableGain.toFixed(2)}</p>
        <p className="font-semibold">Tax: ${result.tax.toFixed(2)}</p>
        <p className="font-semibold">After-Tax Net Profit: ${result.netProfit.toFixed(2)}</p>
        <p className="font-semibold">After-Tax Return Rate: {result.netReturnRate.toFixed(2)}%</p>
      </div>
    </div>
  );
}
