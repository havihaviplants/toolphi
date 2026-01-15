"use client";

import { useMemo, useState } from "react";

function formatMoney(n: number) {
  if (!isFinite(n)) return "-";
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPercent(n: number) {
  if (!isFinite(n)) return "-";
  return `${n.toFixed(2)}%`;
}

export default function OnlinePaymentProcessingCostCalculator() {
  const [monthlyTx, setMonthlyTx] = useState<string>("300");
  const [avgAmount, setAvgAmount] = useState<string>("45");
  const [feeRate, setFeeRate] = useState<string>("2.9");
  const [fixedFee, setFixedFee] = useState<string>("0.30");

  const parsed = useMemo(() => {
    const tx = Number(monthlyTx);
    const avg = Number(avgAmount);
    const rate = Number(feeRate);
    const fixed = Number(fixedFee);

    const valid =
      Number.isFinite(tx) &&
      Number.isFinite(avg) &&
      Number.isFinite(rate) &&
      Number.isFinite(fixed) &&
      tx > 0 &&
      avg > 0 &&
      rate >= 0 &&
      fixed >= 0;

    if (!valid) {
      return { valid: false as const };
    }

    const monthlyVolume = tx * avg;
    const percentFees = (monthlyVolume * rate) / 100;
    const fixedFees = tx * fixed;
    const totalFees = percentFees + fixedFees;
    const effectiveRate = (totalFees / monthlyVolume) * 100;

    return {
      valid: true as const,
      tx,
      avg,
      rate,
      fixed,
      monthlyVolume,
      percentFees,
      fixedFees,
      totalFees,
      effectiveRate,
    };
  }, [monthlyTx, avgAmount, feeRate, fixedFee]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Online Payment Processing Cost Calculator</h1>
        <p className="mt-2 text-gray-600">
          Estimate your monthly payment processing costs using your transaction volume, average ticket size,
          and pricing (percentage + fixed fee).
        </p>
      </div>

      {/* Inputs */}
      <div className="grid gap-6 max-w-xl">
        <div>
          <label className="block font-medium">Monthly Number of Transactions</label>
          <input
            type="number"
            value={monthlyTx}
            onChange={(e) => setMonthlyTx(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="e.g. 300"
            min="1"
          />
          <p className="text-sm text-gray-500 mt-1">
            How many payments you process in a typical month.
          </p>
        </div>

        <div>
          <label className="block font-medium">Average Transaction Amount</label>
          <input
            type="number"
            value={avgAmount}
            onChange={(e) => setAvgAmount(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="e.g. 45"
            min="0"
            step="0.01"
          />
          <p className="text-sm text-gray-500 mt-1">
            Your average order value (AOV) or average invoice amount.
          </p>
        </div>

        <div>
          <label className="block font-medium">Fee Rate (%)</label>
          <input
            type="number"
            value={feeRate}
            onChange={(e) => setFeeRate(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="e.g. 2.9"
            min="0"
            step="0.01"
          />
          <p className="text-sm text-gray-500 mt-1">
            Percentage fee charged by your payment processor (e.g., 2.9%).
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
            min="0"
            step="0.01"
          />
          <p className="text-sm text-gray-500 mt-1">
            Flat fee charged per transaction (e.g., $0.30).
          </p>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-2xl space-y-4">
        <h2 className="text-xl font-semibold">Results</h2>

        {!parsed.valid ? (
          <div className="rounded-lg border p-6 text-gray-700">
            Enter valid numbers above to see your estimated processing costs.
          </div>
        ) : (
          <div className="rounded-lg border p-6 space-y-3">
            <div className="flex justify-between">
              <span>Estimated Monthly Volume</span>
              <span className="font-semibold">${formatMoney(parsed.monthlyVolume)}</span>
            </div>

            <div className="flex justify-between">
              <span>Percentage Fees</span>
              <span className="font-semibold">${formatMoney(parsed.percentFees)}</span>
            </div>

            <div className="flex justify-between">
              <span>Fixed Fees</span>
              <span className="font-semibold">${formatMoney(parsed.fixedFees)}</span>
            </div>

            <div className="flex justify-between border-t pt-3">
              <span>Total Monthly Processing Fees</span>
              <span className="font-semibold">${formatMoney(parsed.totalFees)}</span>
            </div>

            <div className="flex justify-between">
              <span>Effective Fee Rate</span>
              <span className="font-semibold">{formatPercent(parsed.effectiveRate)}</span>
            </div>

            <p className="text-sm text-gray-500 pt-2">
              Effective fee rate = total fees ÷ monthly volume. This helps compare pricing models.
            </p>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="max-w-2xl space-y-3">
        <h2 className="text-xl font-semibold">How it works</h2>
        <p className="text-gray-600">
          Most payment processors charge a percentage of each transaction plus a fixed fee per transaction.
          This calculator estimates your monthly costs by multiplying your monthly volume by the percentage fee,
          then adding your transaction count times the fixed fee.
        </p>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl space-y-4">
        <h2 className="text-xl font-semibold">FAQ</h2>

        <div>
          <h3 className="font-medium">Does this include chargebacks or refunds?</h3>
          <p className="text-gray-600">
            No. Chargeback, refund, and dispute fees vary by provider and are not included here.
          </p>
        </div>

        <div>
          <h3 className="font-medium">What if I have tiered or blended pricing?</h3>
          <p className="text-gray-600">
            Use an average effective fee rate and fixed fee that best represents your overall pricing.
          </p>
        </div>

        <div>
          <h3 className="font-medium">Why does effective fee rate matter?</h3>
          <p className="text-gray-600">
            Effective rate makes it easier to compare processors, especially when average transaction size changes.
          </p>
        </div>
      </div>
    </div>
  );
}
