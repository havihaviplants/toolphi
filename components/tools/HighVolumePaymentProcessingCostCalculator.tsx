"use client";

import { useMemo, useState } from "react";

export default function HighVolumePaymentProcessingCostCalculator() {
  const [monthlyVolume, setMonthlyVolume] = useState("500000");
  const [transactions, setTransactions] = useState("10000");
  const [feeRate, setFeeRate] = useState("2.6");
  const [fixedFee, setFixedFee] = useState("0.10");

  const result = useMemo(() => {
    const vol = Number(monthlyVolume);
    const tx = Number(transactions);
    const ratePct = Number(feeRate);
    const fixed = Number(fixedFee);

    const valid =
      vol > 0 &&
      tx > 0 &&
      ratePct >= 0 &&
      fixed >= 0 &&
      isFinite(vol) &&
      isFinite(tx) &&
      isFinite(ratePct) &&
      isFinite(fixed);

    if (!valid) return null;

    const avgTx = vol / tx;
    const percentFees = (vol * ratePct) / 100;
    const fixedFees = tx * fixed;
    const totalFees = percentFees + fixedFees;
    const effectiveRate = (totalFees / vol) * 100;

    return {
      avgTx,
      percentFees,
      fixedFees,
      totalFees,
      effectiveRate,
    };
  }, [monthlyVolume, transactions, feeRate, fixedFee]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">
          High-Volume Payment Processing Cost Calculator
        </h1>
        <p className="mt-2 text-gray-600">
          Estimate processing costs for high-volume businesses and see how
          average transaction size affects your effective fee rate.
        </p>
      </div>

      <div className="grid gap-6 max-w-xl">
        <div>
          <label className="block font-medium">Monthly Payment Volume</label>
          <input
            type="number"
            value={monthlyVolume}
            onChange={(e) => setMonthlyVolume(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Total gross payment volume processed in a month.
          </p>
        </div>

        <div>
          <label className="block font-medium">Monthly Transactions</label>
          <input
            type="number"
            value={transactions}
            onChange={(e) => setTransactions(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Total number of payments processed in the month.
          </p>
        </div>

        <div>
          <label className="block font-medium">Fee Rate (%)</label>
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
      </div>

      {result && (
        <div className="max-w-2xl rounded-lg border p-6 space-y-3">
          <div className="flex justify-between">
            <span>Average Transaction Size</span>
            <span className="font-semibold">${result.avgTx.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Percentage Fees</span>
            <span className="font-semibold">${result.percentFees.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Fixed Fees</span>
            <span className="font-semibold">${result.fixedFees.toFixed(2)}</span>
          </div>

          <div className="flex justify-between border-t pt-3">
            <span>Total Monthly Fees</span>
            <span className="font-semibold">${result.totalFees.toFixed(2)}</span>
          </div>

          <p className="text-sm text-gray-600">
            Effective fee rate: <strong>{result.effectiveRate.toFixed(2)}%</strong>
          </p>
        </div>
      )}

      <div className="max-w-2xl space-y-3">
        <h2 className="text-xl font-semibold">How it works</h2>
        <p className="text-gray-600">
          Processing costs combine a percentage fee on total volume and a fixed
          fee per transaction. When average transaction size is small, fixed
          fees can significantly increase the effective rate.
        </p>
      </div>

      <div className="max-w-2xl space-y-4">
        <h2 className="text-xl font-semibold">FAQ</h2>

        <div>
          <h3 className="font-medium">Why does average transaction size matter?</h3>
          <p className="text-gray-600">
            Fixed fees are charged per transaction, so smaller transactions pay
            proportionally more in fixed fees.
          </p>
        </div>

        <div>
          <h3 className="font-medium">Does this include refunds or chargebacks?</h3>
          <p className="text-gray-600">
            No. It estimates processing fees only. Add operational and dispute
            costs separately if they apply.
          </p>
        </div>
      </div>
    </div>
  );
}
