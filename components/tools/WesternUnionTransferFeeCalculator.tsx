"use client";

import { useMemo, useState } from "react";

function num(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function WesternUnionTransferFeeCalculator() {
  const [amount, setAmount] = useState<number>(300);
  const [transferFee, setTransferFee] = useState<number>(12);
  const [fxMarkup, setFxMarkup] = useState<number>(3); // %

  const r = useMemo(() => {
    const a = Math.max(0, num(amount));
    const f = Math.max(0, num(transferFee));
    const x = Math.max(0, num(fxMarkup));

    const fxCost = a * (x / 100);
    const totalCost = f + fxCost;
    const effectiveRate = a > 0 ? (totalCost / a) * 100 : 0;
    const netAfterFees = Math.max(0, a - totalCost);

    return { fxCost, totalCost, effectiveRate, netAfterFees };
  }, [amount, transferFee, fxMarkup]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Amount to Send ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Transfer Fee ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={transferFee}
            onChange={(e) => setTransferFee(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">FX Markup (%)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={fxMarkup}
            onChange={(e) => setFxMarkup(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          Western Union transfer costs often include a visible fee and a hidden exchange rate markup.
        </p>

        <p className="font-semibold">Total Cost: ${r.totalCost.toFixed(2)}</p>
        <p>Effective Fee Rate: {r.effectiveRate.toFixed(2)}%</p>
        <p>Estimated Net After Fees: ${r.netAfterFees.toFixed(2)}</p>
        <p className="text-sm opacity-80">
          FX Markup Cost: ${r.fxCost.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
