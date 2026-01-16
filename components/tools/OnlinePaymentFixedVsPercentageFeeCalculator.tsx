"use client";

import { useMemo, useState } from "react";

export default function OnlinePaymentFixedVsPercentageFeeCalculator() {
  const [fixedFee, setFixedFee] = useState("1");
  const [percentFee, setPercentFee] = useState("2.9");
  const [amount, setAmount] = useState("30");

  const result = useMemo(() => {
    const fixed = Number(fixedFee);
    const pct = Number(percentFee) / 100;
    const amt = Number(amount);

    const valid =
      fixed >= 0 &&
      pct >= 0 &&
      amt > 0 &&
      isFinite(fixed) &&
      isFinite(pct) &&
      isFinite(amt);

    if (!valid) return null;

    const fixedCost = fixed;
    const percentCost = amt * pct;

    // break-even: fixed = amt*pct => amt = fixed/pct
    const breakEvenAmount = pct > 0 ? fixed / pct : null;

    let cheaper: "Fixed" | "Percentage" | "Equal" = "Equal";
    if (fixedCost < percentCost) cheaper = "Fixed";
    if (fixedCost > percentCost) cheaper = "Percentage";

    return {
      fixedCost,
      percentCost,
      breakEvenAmount,
      cheaper,
    };
  }, [fixedFee, percentFee, amount]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">
          Online Payment Fixed vs Percentage Fee Calculator
        </h1>
        <p className="mt-2 text-gray-600">
          Compare fixed fees versus percentage fees and find the break-even
          transaction amount where one pricing model becomes cheaper.
        </p>
      </div>

      <div className="grid gap-6 max-w-xl">
        <div>
          <label className="block font-medium">Fixed Fee</label>
          <input
            type="number"
            value={fixedFee}
            onChange={(e) => setFixedFee(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Flat fee charged per transaction.
          </p>
        </div>

        <div>
          <label className="block font-medium">Percentage Fee (%)</label>
          <input
            type="number"
            value={percentFee}
            onChange={(e) => setPercentFee(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Percentage applied to the transaction amount.
          </p>
        </div>

        <div>
          <label className="block font-medium">Transaction Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Amount you want to test for comparison.
          </p>
        </div>
      </div>

      {result && (
        <div className="max-w-xl rounded-lg border p-6 space-y-3">
          <div className="flex justify-between">
            <span>Fixed Fee Cost</span>
            <span className="font-semibold">${result.fixedCost.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Percentage Fee Cost</span>
            <span className="font-semibold">
              ${result.percentCost.toFixed(2)}
            </span>
          </div>

          <div className="border-t pt-3 text-sm text-gray-700">
            Cheaper option: <strong>{result.cheaper}</strong>
          </div>

          {result.breakEvenAmount !== null && (
            <p className="text-sm text-gray-600">
              Break-even amount:{" "}
              <strong>${result.breakEvenAmount.toFixed(2)}</strong>
            </p>
          )}

          {result.breakEvenAmount === null && (
            <p className="text-sm text-gray-600">
              Break-even amount is not available when the percentage fee is 0%.
            </p>
          )}
        </div>
      )}

      <div className="max-w-xl space-y-2">
        <h2 className="font-semibold">How it works</h2>
        <p className="text-sm text-gray-600">
          The break-even point is where fixed fee equals percentage fee. Above
          that amount, the fixed fee becomes cheaper; below it, the percentage
          fee tends to be cheaper.
        </p>
      </div>
    </div>
  );
}
