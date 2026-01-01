"use client";

import { useMemo, useState } from "react";

function safeNum(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function MoneyGramChargesCalculator() {
  const [amount, setAmount] = useState<number>(600);

  // MoneyGram explicit charges (fixed + %)
  const [fixedFee, setFixedFee] = useState<number>(4);
  const [percentFee, setPercentFee] = useState<number>(1.0);

  // Optional caps
  const [minFee, setMinFee] = useState<number>(0);
  const [maxFee, setMaxFee] = useState<number>(0);

  // Optional promos / discounts
  const [discountPercent, setDiscountPercent] = useState<number>(15);
  const [discountFixed, setDiscountFixed] = useState<number>(0);

  // Other explicit charges (payment method surcharge, etc.)
  const [otherCharges, setOtherCharges] = useState<number>(0);

  const r = useMemo(() => {
    const a = Math.max(0, safeNum(amount));

    const fixed = Math.max(0, safeNum(fixedFee));
    const pct = Math.max(0, safeNum(percentFee));
    const min = Math.max(0, safeNum(minFee));
    const max = Math.max(0, safeNum(maxFee));

    const dPct = Math.max(0, safeNum(discountPercent));
    const dFixed = Math.max(0, safeNum(discountFixed));
    const other = Math.max(0, safeNum(otherCharges));

    const percentCost = a * (pct / 100);
    const baseFee = fixed + percentCost;

    let cappedFee = baseFee;
    let capNote = "No cap applied";

    if (min > 0 && cappedFee < min) {
      cappedFee = min;
      capNote = "Minimum fee applied";
    }
    if (max > 0 && cappedFee > max) {
      cappedFee = max;
      capNote = "Maximum fee applied";
    }

    const percentDiscountValue = cappedFee * (dPct / 100);
    const discountedFee = Math.max(0, cappedFee - percentDiscountValue - dFixed);

    const finalCharges = discountedFee + other;
    const effectiveRate = a > 0 ? (finalCharges / a) * 100 : 0;

    return {
      a,
      fixed,
      pct,
      percentCost,
      baseFee,
      min,
      max,
      cappedFee,
      capNote,
      dPct,
      dFixed,
      percentDiscountValue,
      discountedFee,
      other,
      finalCharges,
      effectiveRate,
    };
  }, [
    amount,
    fixedFee,
    percentFee,
    minFee,
    maxFee,
    discountPercent,
    discountFixed,
    otherCharges,
  ]);

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
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          Estimate <strong>MoneyGram explicit charges</strong> (fixed + percentage fees) with optional caps and promo discounts.
          FX markup (exchange-rate spread) is handled in a separate markup tool.
        </p>
        <p className="text-sm opacity-80">
          Base Fee = Fixed Fee + (Amount × % Fee) → Apply Min/Max Caps → Apply Discounts → Add Other Charges
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
          <p className="mt-1 text-xs opacity-70">Flat service fee charged by MoneyGram.</p>
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
          <p className="mt-1 text-xs opacity-70">Percent of amount charged as a fee (varies by corridor & method).</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Minimum Fee Cap ($) (optional)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={minFee}
            onChange={(e) => setMinFee(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">If the base fee is below this, the minimum applies.</p>
        </div>

        <div>
          <label className="block text-sm font-medium">Maximum Fee Cap ($) (optional)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={maxFee}
            onChange={(e) => setMaxFee(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">If the base fee is above this, the maximum applies.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Promo Discount (%) (optional)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">Percent off the capped fee (promo/membership).</p>
        </div>

        <div>
          <label className="block text-sm font-medium">Promo Discount ($) (optional)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={discountFixed}
            onChange={(e) => setDiscountFixed(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">Fixed amount off the capped fee.</p>
        </div>

        <div>
          <label className="block text-sm font-medium">Other Charges ($) (optional)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={otherCharges}
            onChange={(e) => setOtherCharges(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">Payment method surcharge or extra explicit charges.</p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="font-semibold">
          MoneyGram Charges: ${r.finalCharges.toFixed(2)}{" "}
          <span className="text-sm font-normal opacity-80">
            (Effective Rate: {r.effectiveRate.toFixed(2)}%)
          </span>
        </p>
        <p className="text-sm opacity-80">{r.capNote}</p>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left opacity-80">
                <th className="py-2 pr-3">Step</th>
                <th className="py-2 text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="py-2 pr-3 font-medium">Fixed fee</td>
                <td className="py-2 text-right">${r.fixed.toFixed(2)}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-3 font-medium">% fee cost</td>
                <td className="py-2 text-right">${r.percentCost.toFixed(2)}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-3 font-medium">Base fee</td>
                <td className="py-2 text-right">${r.baseFee.toFixed(2)}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-3 font-medium">Fee after min/max caps</td>
                <td className="py-2 text-right">${r.cappedFee.toFixed(2)}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-3 font-medium">Discount (%) value</td>
                <td className="py-2 text-right">-${r.percentDiscountValue.toFixed(2)}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-3 font-medium">Discount ($)</td>
                <td className="py-2 text-right">-${r.dFixed.toFixed(2)}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-3 font-medium">Fee after discounts</td>
                <td className="py-2 text-right">${r.discountedFee.toFixed(2)}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-3 font-medium">Other charges</td>
                <td className="py-2 text-right">${r.other.toFixed(2)}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-3 font-semibold">Final charges</td>
                <td className="py-2 text-right font-semibold">${r.finalCharges.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs opacity-70">
          Note: Exchange-rate markup (spread) is not included here—use a MoneyGram FX markup tool to estimate hidden FX costs.
        </p>
      </div>
    </div>
  );
}
