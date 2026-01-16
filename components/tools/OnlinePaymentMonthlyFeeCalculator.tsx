"use client";

import { useMemo, useState } from "react";

export default function OnlinePaymentMonthlyFeeCalculator() {
  const [monthlyRevenue, setMonthlyRevenue] = useState("50000");
  const [monthlyTransactions, setMonthlyTransactions] = useState("1000");
  const [feeRate, setFeeRate] = useState("2.9");
  const [fixedFee, setFixedFee] = useState("0.30");

  const result = useMemo(() => {
    const rev = Number(monthlyRevenue);
    const tx = Number(monthlyTransactions);
    const ratePct = Number(feeRate);
    const fixed = Number(fixedFee);

    const valid =
      rev > 0 &&
      tx > 0 &&
      ratePct >= 0 &&
      fixed >= 0 &&
      isFinite(rev) &&
      isFinite(tx) &&
      isFinite(ratePct) &&
      isFinite(fixed);

    if (!valid) return null;

    const percentFees = (rev * ratePct) / 100;
    const fixedFees = tx * fixed;
    const totalFees = percentFees + fixedFees;
    const effectiveRate = (totalFees / rev) * 100;

    return {
      percentFees,
      fixedFees,
      totalFees,
      effectiveRate,
    };
  }, [monthlyRevenue, monthlyTransactions, feeRate, fixedFee]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">
          Online Payment Monthly Fee Calculator
        </h1>
        <p className="mt-2 text-gray-600">
          Estimate your total monthly payment processing fees based on revenue,
          transaction volume, and fee structure.
        </p>
      </div>

      <div className="grid gap-6 max-w-xl">
        <div>
          <label className="block font-medium">Monthly Revenue</label>
          <input
            type="number"
            value={monthlyRevenue}
            onChange={(e) => setMonthlyRevenue(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Total gross payment volume for the month.
          </p>
        </div>

        <div>
          <label className="block font-medium">Monthly Transactions</label>
          <input
            type="number"
            value={monthlyTransactions}
            onChange={(e) => setMonthlyTransactions(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Number of payments processed in the month.
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
          <p className="text-sm text-gray-500 mt-1">
            Percentage fee charged on total processed volume.
          </p>
        </div>

        <div>
          <label className="block font-medium">Fixed Fee per Transaction</label>
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
      </div>

      {result && (
        <div className="rounded-lg border p-6 max-w-2xl space-y-3">
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
            Effective monthly fee rate: <strong>{result.effectiveRate.toFixed(2)}%</strong>
          </p>
        </div>
      )}

      <div className="max-w-2xl space-y-3">
        <h2 className="text-xl font-semibold">How it works</h2>
        <p className="text-gray-600">
          Monthly fees are calculated as (monthly revenue × fee rate) plus
          (transaction count × fixed fee). The effective rate includes both.
        </p>
      </div>

      <div className="max-w-2xl space-y-4">
        <h2 className="text-xl font-semibold">FAQ</h2>

        <div>
          <h3 className="font-medium">Why does the effective rate change?</h3>
          <p className="text-gray-600">
            Fixed fees matter more when average transaction size is small.
          </p>
        </div>

        <div>
          <h3 className="font-medium">Does this include chargebacks or monthly platform fees?</h3>
          <p className="text-gray-600">
            No. This calculator covers processing fees only. Add other costs
            separately if your provider charges them.
          </p>
        </div>
      </div>
    </div>
  );
}
