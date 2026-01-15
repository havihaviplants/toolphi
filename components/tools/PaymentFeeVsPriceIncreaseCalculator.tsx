"use client";

import { useMemo, useState } from "react";

export default function PaymentFeeVsPriceIncreaseCalculator() {
  const [price, setPrice] = useState("100");
  const [cost, setCost] = useState("60");
  const [feeRate, setFeeRate] = useState("2.9");
  const [fixedFee, setFixedFee] = useState("0.30");
  const [priceIncrease, setPriceIncrease] = useState("2");

  const result = useMemo(() => {
    const p = Number(price);
    const c = Number(cost);
    const rate = Number(feeRate) / 100;
    const fixed = Number(fixedFee);
    const inc = Number(priceIncrease) / 100;

    const valid =
      p > 0 &&
      c >= 0 &&
      rate >= 0 &&
      fixed >= 0 &&
      inc >= 0 &&
      isFinite(p) &&
      isFinite(c) &&
      isFinite(rate) &&
      isFinite(fixed) &&
      isFinite(inc);

    if (!valid) return null;

    // absorb fees
    const fee = p * rate + fixed;
    const profitAbsorb = p - c - fee;

    // raise price
    const newPrice = p * (1 + inc);
    const newFee = newPrice * rate + fixed;
    const profitRaise = newPrice - c - newFee;

    return {
      profitAbsorb,
      profitRaise,
      diff: profitRaise - profitAbsorb,
    };
  }, [price, cost, feeRate, fixedFee, priceIncrease]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">
          Payment Fee vs Price Increase Calculator
        </h1>
        <p className="mt-2 text-gray-600">
          Compare whether absorbing payment fees or increasing prices leads to
          better profitability.
        </p>
      </div>

      <div className="grid gap-6 max-w-xl">
        <div>
          <label className="block font-medium">Current Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Cost per Unit</label>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Payment Fee Rate (%)</label>
          <input
            type="number"
            value={feeRate}
            onChange={(e) => setFeeRate(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Fixed Fee</label>
          <input
            type="number"
            value={fixedFee}
            onChange={(e) => setFixedFee(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Price Increase (%)</label>
          <input
            type="number"
            value={priceIncrease}
            onChange={(e) => setPriceIncrease(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
      </div>

      {result && (
        <div className="rounded-lg border p-6 max-w-2xl space-y-3">
          <div className="flex justify-between">
            <span>Profit (Absorb Fees)</span>
            <span className="font-semibold">
              ${result.profitAbsorb.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Profit (Raise Prices)</span>
            <span className="font-semibold">
              ${result.profitRaise.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between border-t pt-3">
            <span>Difference</span>
            <span className="font-semibold">
              ${result.diff.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
