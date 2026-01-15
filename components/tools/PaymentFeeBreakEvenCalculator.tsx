"use client";

import { useMemo, useState } from "react";

export default function PaymentFeeBreakEvenCalculator() {
  const [margin, setMargin] = useState("40");
  const [feeRate, setFeeRate] = useState("2.9");
  const [fixedFee, setFixedFee] = useState("0.30");
  const [avgTx, setAvgTx] = useState("50");

  const result = useMemo(() => {
    const m = Number(margin) / 100;
    const rate = Number(feeRate) / 100;
    const fixed = Number(fixedFee);
    const avg = Number(avgTx);

    const valid =
      m > 0 &&
      rate >= 0 &&
      fixed >= 0 &&
      avg > 0 &&
      isFinite(m) &&
      isFinite(rate) &&
      isFinite(fixed) &&
      isFinite(avg);

    if (!valid) return null;

    // profit per transaction before fees
    const grossProfitPerTx = avg * m;

    // fee per transaction
    const feePerTx = avg * rate + fixed;

    // break-even when profit = fee
    const breakEvenTx = feePerTx / grossProfitPerTx;

    const breakEvenRevenue = breakEvenTx * avg;

    return {
      breakEvenTx,
      breakEvenRevenue,
    };
  }, [margin, feeRate, fixedFee, avgTx]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">
          Payment Fee Break-Even Calculator
        </h1>
        <p className="mt-2 text-gray-600">
          Determine how much revenue or how many transactions you need to
          generate to offset payment processing fees.
        </p>
      </div>

      <div className="grid gap-6 max-w-xl">
        <div>
          <label className="block font-medium">Gross Margin (%)</label>
          <input
            type="number"
            value={margin}
            onChange={(e) => setMargin(e.target.value)}
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
          <label className="block font-medium">Fixed Fee per Transaction</label>
          <input
            type="number"
            value={fixedFee}
            onChange={(e) => setFixedFee(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Average Transaction Amount</label>
          <input
            type="number"
            value={avgTx}
            onChange={(e) => setAvgTx(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
      </div>

      {result && (
        <div className="rounded-lg border p-6 max-w-2xl space-y-3">
          <div className="flex justify-between">
            <span>Break-Even Transactions</span>
            <span className="font-semibold">
              {result.breakEvenTx.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Break-Even Revenue</span>
            <span className="font-semibold">
              ${result.breakEvenRevenue.toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            This is the point where gross profit equals payment fees.
          </p>
        </div>
      )}

      <div className="max-w-2xl space-y-3">
        <h2 className="text-xl font-semibold">How it works</h2>
        <p className="text-gray-600">
          The calculator compares profit per transaction against payment fees
          to find the point where fees are fully offset by margin.
        </p>
      </div>
    </div>
  );
}
