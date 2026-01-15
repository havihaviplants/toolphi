"use client";

import { useMemo, useState } from "react";

export default function PaymentFeeImpactOnProfitCalculator() {
  const [revenue, setRevenue] = useState("50000");
  const [margin, setMargin] = useState("40");
  const [feeRate, setFeeRate] = useState("2.9");
  const [txCount, setTxCount] = useState("500");
  const [fixedFee, setFixedFee] = useState("0.30");

  const result = useMemo(() => {
    const rev = Number(revenue);
    const m = Number(margin);
    const rate = Number(feeRate);
    const tx = Number(txCount);
    const fixed = Number(fixedFee);

    const valid =
      rev > 0 &&
      m >= 0 &&
      rate >= 0 &&
      tx > 0 &&
      fixed >= 0 &&
      isFinite(rev) &&
      isFinite(m) &&
      isFinite(rate) &&
      isFinite(tx) &&
      isFinite(fixed);

    if (!valid) return null;

    const grossProfit = rev * (m / 100);
    const percentFees = (rev * rate) / 100;
    const fixedFees = tx * fixed;
    const totalFees = percentFees + fixedFees;
    const netProfitAfterFees = grossProfit - totalFees;
    const profitLossPct = (totalFees / grossProfit) * 100;

    return {
      grossProfit,
      totalFees,
      netProfitAfterFees,
      profitLossPct,
    };
  }, [revenue, margin, feeRate, txCount, fixedFee]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">
          Payment Fee Impact on Profit Calculator
        </h1>
        <p className="mt-2 text-gray-600">
          See how payment processing fees reduce your gross profit and affect
          net profitability.
        </p>
      </div>

      <div className="grid gap-6 max-w-xl">
        <div>
          <label className="block font-medium">Monthly Revenue</label>
          <input
            type="number"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

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
          <label className="block font-medium">Monthly Transactions</label>
          <input
            type="number"
            value={txCount}
            onChange={(e) => setTxCount(e.target.value)}
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
      </div>

      {result && (
        <div className="rounded-lg border p-6 max-w-2xl space-y-3">
          <div className="flex justify-between">
            <span>Gross Profit (before fees)</span>
            <span className="font-semibold">
              ${result.grossProfit.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total Payment Fees</span>
            <span className="font-semibold">
              ${result.totalFees.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between border-t pt-3">
            <span>Net Profit After Fees</span>
            <span className="font-semibold">
              ${result.netProfitAfterFees.toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Payment fees consume{" "}
            <strong>{result.profitLossPct.toFixed(2)}%</strong> of your gross
            profit.
          </p>
        </div>
      )}

      <div className="max-w-2xl space-y-3">
        <h2 className="text-xl font-semibold">How it works</h2>
        <p className="text-gray-600">
          Gross profit is calculated using your margin. Payment fees are then
          subtracted to show how much profit is lost due to transaction costs.
        </p>
      </div>
    </div>
  );
}
