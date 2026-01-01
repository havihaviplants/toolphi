"use client";

import { useMemo, useState } from "react";

function safeNum(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function BankTransferChargesCalculator() {
  const [amount, setAmount] = useState<number>(1500);

  const [fixedFee, setFixedFee] = useState<number>(10);
  const [percentFee, setPercentFee] = useState<number>(0.6);
  const [fxMarkup, setFxMarkup] = useState<number>(0.8);

  const r = useMemo(() => {
    const a = Math.max(0, safeNum(amount));
    const fixed = Math.max(0, safeNum(fixedFee));
    const pct = Math.max(0, safeNum(percentFee));
    const fx = Math.max(0, safeNum(fxMarkup));

    const percentCost = a * (pct / 100);
    const fxCost = a * (fx / 100);
    const totalCost = fixed + percentCost + fxCost;

    const effectiveRate = a > 0 ? (totalCost / a) * 100 : 0;

    return { a, fixed, pct, fx, percentCost, fxCost, totalCost, effectiveRate };
  }, [amount, fixedFee, percentFee, fxMarkup]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Transfer Amount ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          Bank transfer charges can include a fixed fee, a percentage fee, and hidden FX costs if currency conversion applies.
        </p>
        <p className="text-sm opacity-80">
          Total Charges = Fixed Fee + (Amount × % Fee) + (Amount × FX Markup)
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Fixed Transfer Fee ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={fixedFee}
            onChange={(e) => setFixedFee(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">
            A flat fee the bank charges per transfer (domestic or international).
          </p>
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
          <p className="mt-1 text-xs opacity-70">
            Some banks charge a percentage of the transfer amount (often capped).
          </p>
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
          <p className="mt-1 text-xs opacity-70">
            Hidden exchange-rate cost when converting currencies.
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="font-semibold">
          Total Charges: ${r.totalCost.toFixed(2)}{" "}
          <span className="text-sm font-normal opacity-80">
            (Effective Rate: {r.effectiveRate.toFixed(2)}%)
          </span>
        </p>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left opacity-80">
                <th className="py-2 pr-3">Component</th>
                <th className="py-2 text-right">Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="py-2 pr-3 font-medium">Fixed fee</td>
                <td className="py-2 text-right">${r.fixed.toFixed(2)}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-3 font-medium">Percentage fee</td>
                <td className="py-2 text-right">${r.percentCost.toFixed(2)}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-3 font-medium">FX markup</td>
                <td className="py-2 text-right">${r.fxCost.toFixed(2)}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-3 font-semibold">Total</td>
                <td className="py-2 text-right font-semibold">${r.totalCost.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs opacity-70">
          Tip: If your bank quotes a fee range, plug in the high end to see worst-case cost.
        </p>
      </div>
    </div>
  );
}
