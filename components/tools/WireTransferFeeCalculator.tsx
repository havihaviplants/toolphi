"use client";

import { useMemo, useState } from "react";

function clampNumber(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function WireTransferFeeCalculator() {
  const [sendAmount, setSendAmount] = useState<number>(1000);
  const [fixedFee, setFixedFee] = useState<number>(25);
  const [percentFee, setPercentFee] = useState<number>(0.5); // %
  const [fxMarkup, setFxMarkup] = useState<number>(1); // %

  const result = useMemo(() => {
    const amount = Math.max(0, clampNumber(sendAmount));
    const fixed = Math.max(0, clampNumber(fixedFee));
    const pct = Math.max(0, clampNumber(percentFee));
    const fx = Math.max(0, clampNumber(fxMarkup));

    const percentCost = amount * (pct / 100);
    const fxCost = amount * (fx / 100);

    const totalCost = fixed + percentCost + fxCost;
    const effectiveRate = amount > 0 ? (totalCost / amount) * 100 : 0;
    const netReceived = Math.max(0, amount - totalCost);

    return {
      amount,
      fixed,
      percentCost,
      fxCost,
      totalCost,
      effectiveRate,
      netReceived,
    };
  }, [sendAmount, fixedFee, percentFee, fxMarkup]);

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
            value={sendAmount}
            onChange={(e) => setSendAmount(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Fixed Wire Fee ($)</label>
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
          <label className="block text-sm font-medium">Percentage Fee (%) (optional)</label>
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
          <label className="block text-sm font-medium">FX Markup (%) (optional)</label>
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
          Some providers charge a fixed fee, some charge a percent, and many hide costs in the exchange rate.
          Use the FX markup field if currency conversion is involved.
        </p>

        <p className="font-semibold">Total Transfer Cost: ${result.totalCost.toFixed(2)}</p>
        <p>Effective Fee Rate: {result.effectiveRate.toFixed(2)}%</p>
        <p className="text-sm opacity-80">
          Breakdown — Fixed: ${result.fixed.toFixed(2)}, Percent: ${result.percentCost.toFixed(2)}, FX Markup: $
          {result.fxCost.toFixed(2)}
        </p>
        <p>Estimated Net After Fees: ${result.netReceived.toFixed(2)}</p>
      </div>
    </div>
  );
}
