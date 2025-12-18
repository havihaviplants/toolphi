"use client";

import { useMemo, useState } from "react";

function safeNum(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function InternationalMoneyTransferFeeCalculator() {
  const [sendAmount, setSendAmount] = useState<number>(500);
  const [fixedFee, setFixedFee] = useState<number>(4);
  const [percentFee, setPercentFee] = useState<number>(1); // %
  const [fxMarkup, setFxMarkup] = useState<number>(2); // %

  const r = useMemo(() => {
    const amount = Math.max(0, safeNum(sendAmount));
    const fixed = Math.max(0, safeNum(fixedFee));
    const pct = Math.max(0, safeNum(percentFee));
    const fx = Math.max(0, safeNum(fxMarkup));

    const percentCost = amount * (pct / 100);
    const fxCost = amount * (fx / 100);
    const totalCost = fixed + percentCost + fxCost;

    const effectiveRate = amount > 0 ? (totalCost / amount) * 100 : 0;
    const netAfterFees = Math.max(0, amount - totalCost);

    return { amount, fixed, percentCost, fxCost, totalCost, effectiveRate, netAfterFees };
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
          <label className="block text-sm font-medium">Fixed Fee ($)</label>
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
          International transfers often have hidden costs in the exchange rate. Use FX Markup to model that.
        </p>

        <p className="font-semibold">Total Cost: ${r.totalCost.toFixed(2)}</p>
        <p>Effective Fee Rate: {r.effectiveRate.toFixed(2)}%</p>

        <p className="text-sm opacity-80">
          Breakdown — Fixed: ${r.fixed.toFixed(2)}, Percent: ${r.percentCost.toFixed(2)}, FX Markup: $
          {r.fxCost.toFixed(2)}
        </p>

        <p>Estimated Net After Fees: ${r.netAfterFees.toFixed(2)}</p>
      </div>
    </div>
  );
}
