"use client";

import { useMemo, useState } from "react";

export default function OnlinePaymentFeeBreakEvenCalculator() {
  const [amount, setAmount] = useState("50");

  const [aRate, setARate] = useState("2.9");
  const [aFixed, setAFixed] = useState("0.30");

  const [bRate, setBRate] = useState("2.6");
  const [bFixed, setBFixed] = useState("0.10");

  const result = useMemo(() => {
    const amt = Number(amount);

    const ar = Number(aRate) / 100;
    const af = Number(aFixed);

    const br = Number(bRate) / 100;
    const bf = Number(bFixed);

    const valid =
      amt > 0 &&
      ar >= 0 &&
      af >= 0 &&
      br >= 0 &&
      bf >= 0 &&
      isFinite(amt) &&
      isFinite(ar) &&
      isFinite(af) &&
      isFinite(br) &&
      isFinite(bf);

    if (!valid) return null;

    const feeA = amt * ar + af;
    const feeB = amt * br + bf;

    let cheaper: "Plan A" | "Plan B" | "Equal" = "Equal";
    if (feeA < feeB) cheaper = "Plan A";
    if (feeB < feeA) cheaper = "Plan B";

    // break-even where amt*ar + af = amt*br + bf
    // amt*(ar - br) = (bf - af) => amt = (bf - af)/(ar - br)
    const denom = ar - br;
    const numer = bf - af;

    let breakEvenAmount: number | null = null;
    if (denom !== 0) {
      const be = numer / denom;
      // break-even must be positive to be meaningful
      breakEvenAmount = isFinite(be) && be > 0 ? be : null;
    }

    const diff = feeA - feeB; // positive means B cheaper

    return {
      feeA,
      feeB,
      diff,
      cheaper,
      breakEvenAmount,
    };
  }, [amount, aRate, aFixed, bRate, bFixed]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">
          Online Payment Fee Break-Even Calculator
        </h1>
        <p className="mt-2 text-gray-600">
          Compare two fee plans and find the break-even transaction amount where
          switching becomes cheaper.
        </p>
      </div>

      <div className="grid gap-6 max-w-xl">
        <div>
          <label className="block font-medium">Transaction Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            The amount you want to test (per transaction).
          </p>
        </div>

        <div className="rounded-lg border p-4 space-y-4">
          <div className="font-semibold">Plan A</div>

          <div>
            <label className="block font-medium">Fee Rate (%)</label>
            <input
              type="number"
              value={aRate}
              onChange={(e) => setARate(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium">Fixed Fee</label>
            <input
              type="number"
              value={aFixed}
              onChange={(e) => setAFixed(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
        </div>

        <div className="rounded-lg border p-4 space-y-4">
          <div className="font-semibold">Plan B</div>

          <div>
            <label className="block font-medium">Fee Rate (%)</label>
            <input
              type="number"
              value={bRate}
              onChange={(e) => setBRate(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium">Fixed Fee</label>
            <input
              type="number"
              value={bFixed}
              onChange={(e) => setBFixed(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
        </div>
      </div>

      {result && (
        <div className="max-w-2xl rounded-lg border p-6 space-y-3">
          <div className="flex justify-between">
            <span>Plan A Fee</span>
            <span className="font-semibold">${result.feeA.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Plan B Fee</span>
            <span className="font-semibold">${result.feeB.toFixed(2)}</span>
          </div>

          <div className="border-t pt-3 text-sm text-gray-700">
            Cheaper plan at this amount: <strong>{result.cheaper}</strong>
          </div>

          <p className="text-sm text-gray-600">
            Difference (A − B): <strong>${result.diff.toFixed(2)}</strong>{" "}
            {result.diff > 0 ? "(Plan B cheaper)" : result.diff < 0 ? "(Plan A cheaper)" : ""}
          </p>

          {result.breakEvenAmount !== null ? (
            <p className="text-sm text-gray-600">
              Break-even transaction amount:{" "}
              <strong>${result.breakEvenAmount.toFixed(2)}</strong>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Break-even amount is not meaningful for these fee settings (rates may be identical or dominated).
            </p>
          )}
        </div>
      )}

      <div className="max-w-2xl space-y-3">
        <h2 className="text-xl font-semibold">How it works</h2>
        <p className="text-gray-600">
          Each plan charges a percentage of the transaction plus a fixed fee.
          The break-even point is where both plans cost the same for a single
          transaction.
        </p>
      </div>

      <div className="max-w-2xl space-y-4">
        <h2 className="text-xl font-semibold">FAQ</h2>

        <div>
          <h3 className="font-medium">Is this break-even per transaction or monthly?</h3>
          <p className="text-gray-600">
            This calculator finds a per-transaction break-even amount. For
            monthly switching decisions, combine this with your expected volume.
          </p>
        </div>

        <div>
          <h3 className="font-medium">Does it include chargeback or subscription fees?</h3>
          <p className="text-gray-600">
            No. This compares processing fees only. Add other costs separately.
          </p>
        </div>
      </div>
    </div>
  );
}
