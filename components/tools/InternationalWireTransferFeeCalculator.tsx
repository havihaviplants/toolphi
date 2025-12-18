"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function InternationalWireTransferFeeCalculator() {
  const [amount, setAmount] = useState<number>(2000);
  const [fixedFee, setFixedFee] = useState<number>(45);
  const [percentFee, setPercentFee] = useState<number>(0.5); // %
  const [fxMarkup, setFxMarkup] = useState<number>(1.5); // %

  const r = useMemo(() => {
    const a = Math.max(0, n(amount));
    const f = Math.max(0, n(fixedFee));
    const p = Math.max(0, n(percentFee));
    const x = Math.max(0, n(fxMarkup));

    const percentCost = a * (p / 100);
    const fxCost = a * (x / 100);
    const totalCost = f + percentCost + fxCost;
    const effectiveRate = a > 0 ? (totalCost / a) * 100 : 0;
    const netReceived = Math.max(0, a - totalCost);

    return { percentCost, fxCost, totalCost, effectiveRate, netReceived };
  }, [amount, fixedFee, percentFee, fxMarkup]);

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
          <label className="block text-sm font-medium">Fixed International Wire Fee ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={fixedFee}
            onChange={(e) => setFixedFee(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Percentage Fee (%)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={percentFee}
            onChange={(e) => setPercentFee(Number(e.target.value))}
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
          International wire transfers often include hidden FX markups on top of visible bank fees.
        </p>

        <p className="font-semibold">Total Transfer Cost: ${r.totalCost.toFixed(2)}</p>
        <p>Effective Fee Rate: {r.effectiveRate.toFixed(2)}%</p>
        <p>Estimated Net After Fees: ${r.netReceived.toFixed(2)}</p>
        <p className="text-sm opacity-80">
          Breakdown — Percent: ${r.percentCost.toFixed(2)}, FX Markup: ${r.fxCost.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
