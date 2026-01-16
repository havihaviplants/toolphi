"use client";

import { useMemo, useState } from "react";

export default function OnlinePaymentProviderSwitchingCostCalculator() {
  const [oneTimeCost, setOneTimeCost] = useState("3000");
  const [monthlySavings, setMonthlySavings] = useState("450");
  const [monthlyAddedCost, setMonthlyAddedCost] = useState("50");

  const result = useMemo(() => {
    const one = Number(oneTimeCost);
    const save = Number(monthlySavings);
    const add = Number(monthlyAddedCost);

    const valid =
      one >= 0 &&
      save >= 0 &&
      add >= 0 &&
      isFinite(one) &&
      isFinite(save) &&
      isFinite(add);

    if (!valid) return null;

    const netMonthlySavings = save - add;

    let paybackMonths: number | null = null;
    if (netMonthlySavings > 0) {
      paybackMonths = one / netMonthlySavings;
    }

    return {
      netMonthlySavings,
      paybackMonths,
    };
  }, [oneTimeCost, monthlySavings, monthlyAddedCost]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">
          Online Payment Provider Switching Cost Calculator
        </h1>
        <p className="mt-2 text-gray-600">
          Estimate the cost of switching payment providers and how long it takes
          to recover that cost from monthly savings.
        </p>
      </div>

      <div className="grid gap-6 max-w-xl">
        <div>
          <label className="block font-medium">One-Time Switching Cost</label>
          <input
            type="number"
            value={oneTimeCost}
            onChange={(e) => setOneTimeCost(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Integration work, onboarding, training, downtime, tooling changes, etc.
          </p>
        </div>

        <div>
          <label className="block font-medium">Monthly Fee Savings (after switching)</label>
          <input
            type="number"
            value={monthlySavings}
            onChange={(e) => setMonthlySavings(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Estimate how much less you’ll pay in processing fees per month.
          </p>
        </div>

        <div>
          <label className="block font-medium">Monthly Added Cost (optional)</label>
          <input
            type="number"
            value={monthlyAddedCost}
            onChange={(e) => setMonthlyAddedCost(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Any new monthly costs after switching (subscriptions, tools, admin time).
          </p>
        </div>
      </div>

      {result && (
        <div className="max-w-xl rounded-lg border p-6 space-y-3">
          <div className="flex justify-between">
            <span>Net Monthly Savings</span>
            <span className="font-semibold">
              ${result.netMonthlySavings.toFixed(2)}
            </span>
          </div>

          <div className="border-t pt-3 text-sm text-gray-700">
            Payback period:{" "}
            {result.paybackMonths !== null ? (
              <strong>{result.paybackMonths.toFixed(2)} months</strong>
            ) : (
              <strong>Not recoverable (net savings ≤ 0)</strong>
            )}
          </div>

          <p className="text-sm text-gray-600">
            If your net monthly savings are small, switching may take a long time
            to pay off. Consider non-fee factors like reliability and payout speed.
          </p>
        </div>
      )}

      <div className="max-w-xl space-y-2">
        <h2 className="font-semibold">How it works</h2>
        <p className="text-sm text-gray-600">
          The payback period is calculated as one-time switching cost divided by
          net monthly savings (monthly savings − monthly added costs).
        </p>
      </div>

      <div className="max-w-xl text-xs text-gray-500 leading-relaxed border-t pt-4">
        This calculator provides estimates for comparison purposes only. Actual
        costs and savings vary based on your provider terms, implementation complexity,
        and operational changes.
      </div>
    </div>
  );
}
