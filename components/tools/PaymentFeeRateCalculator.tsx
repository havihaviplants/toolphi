"use client";

import { useMemo, useState } from "react";

export default function PaymentFeeRateCalculator() {
  const [feeRate, setFeeRate] = useState("2.9");
  const [fixedFee, setFixedFee] = useState("0.30");
  const [avgTx, setAvgTx] = useState("50");

  const result = useMemo(() => {
    const ratePct = Number(feeRate);
    const fixed = Number(fixedFee);
    const avg = Number(avgTx);

    const valid =
      ratePct >= 0 &&
      fixed >= 0 &&
      avg > 0 &&
      isFinite(ratePct) &&
      isFinite(fixed) &&
      isFinite(avg);

    if (!valid) return null;

    const percentFee = (avg * ratePct) / 100;
    const totalFee = percentFee + fixed;
    const effectiveRate = (totalFee / avg) * 100;

    return {
      percentFee,
      totalFee,
      effectiveRate,
    };
  }, [feeRate, fixedFee, avgTx]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Payment Fee Rate Calculator</h1>
        <p className="mt-2 text-gray-600">
          Calculate your effective payment fee rate, including fixed fees per
          transaction. This helps you compare pricing across processors.
        </p>
      </div>

      <div className="grid gap-6 max-w-xl">
        <div>
          <label className="block font-medium">Fee Rate (%)</label>
          <input
            type="number"
            value={feeRate}
            onChange={(e) => setFeeRate(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="e.g. 2.9"
          />
          <p className="text-sm text-gray-500 mt-1">
            Percentage fee charged on the transaction amount.
          </p>
        </div>

        <div>
          <label className="block font-medium">Fixed Fee per Transaction</label>
          <input
            type="number"
            value={fixedFee}
            onChange={(e) => setFixedFee(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="e.g. 0.30"
          />
          <p className="text-sm text-gray-500 mt-1">
            Flat fee charged per transaction.
          </p>
        </div>

        <div>
          <label className="block font-medium">Average Transaction Amount</label>
          <input
            type="number"
            value={avgTx}
            onChange={(e) => setAvgTx(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="e.g. 50"
          />
          <p className="text-sm text-gray-500 mt-1">
            Your typical payment size (average order value).
          </p>
        </div>
      </div>

      {result && (
        <div className="rounded-lg border p-6 max-w-2xl space-y-3">
          <div className="flex justify-between">
            <span>Percentage Fee (per transaction)</span>
            <span className="font-semibold">
              ${result.percentFee.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total Fee (percentage + fixed)</span>
            <span className="font-semibold">
              ${result.totalFee.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between border-t pt-3">
            <span>Effective Fee Rate</span>
            <span className="font-semibold">
              {result.effectiveRate.toFixed(2)}%
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Effective fee rate = (total fee ÷ average transaction) × 100
          </p>
        </div>
      )}

      <div className="max-w-2xl space-y-3">
        <h2 className="text-xl font-semibold">How it works</h2>
        <p className="text-gray-600">
          Fixed fees matter more for small transactions. This calculator combines
          percentage and fixed fees to show the effective rate you actually pay.
        </p>
      </div>

      <div className="max-w-2xl space-y-4">
        <h2 className="text-xl font-semibold">FAQ</h2>

        <div>
          <h3 className="font-medium">Why is my effective rate higher than the advertised rate?</h3>
          <p className="text-gray-600">
            Fixed fees increase the cost proportionally when transaction sizes are small.
          </p>
        </div>

        <div>
          <h3 className="font-medium">Can I use this to compare processors?</h3>
          <p className="text-gray-600">
            Yes. Use your typical transaction size and each provider’s fee terms to compare.
          </p>
        </div>
      </div>
    </div>
  );
}
