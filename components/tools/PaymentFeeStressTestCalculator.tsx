"use client";

import { useMemo, useState } from "react";

export default function PaymentFeeStressTestCalculator() {
  const [revenue, setRevenue] = useState("50000");
  const [margin, setMargin] = useState("40");
  const [feeRate, setFeeRate] = useState("2.9");
  const [fixedFee, setFixedFee] = useState("0.30");
  const [feeShock, setFeeShock] = useState("0.5");

  const result = useMemo(() => {
    const rev = Number(revenue);
    const m = Number(margin) / 100;
    const rate = Number(feeRate) / 100;
    const fixed = Number(fixedFee);
    const shock = Number(feeShock) / 100;

    const valid =
      rev > 0 &&
      m > 0 &&
      rate >= 0 &&
      fixed >= 0 &&
      isFinite(rev) &&
      isFinite(m) &&
      isFinite(rate) &&
      isFinite(fixed) &&
      isFinite(shock);

    if (!valid) return null;

    const grossProfit = rev * m;

    const baseFees = rev * rate; // fixed fee ignored at aggregate level
    const stressedFees = rev * (rate + shock);

    const baseNet = grossProfit - baseFees;
    const stressedNet = grossProfit - stressedFees;
    const delta = stressedNet - baseNet;

    return {
      baseNet,
      stressedNet,
      delta,
    };
  }, [revenue, margin, feeRate, fixedFee, feeShock]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Payment Fee Stress Test Calculator</h1>
        <p className="mt-2 text-gray-600">
          Test how sensitive your profits are to changes in payment processing
          fees under different scenarios.
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
          <label className="block font-medium">Current Fee Rate (%)</label>
          <input
            type="number"
            value={feeRate}
            onChange={(e) => setFeeRate(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Fee Increase Scenario (%)</label>
          <input
            type="number"
            value={feeShock}
            onChange={(e) => setFeeShock(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Simulate a fee increase (e.g., +0.5%).
          </p>
        </div>
      </div>

      {result && (
        <div className="rounded-lg border p-6 max-w-2xl space-y-3">
          <div className="flex justify-between">
            <span>Baseline Net Profit</span>
            <span className="font-semibold">
              ${result.baseNet.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Net Profit After Fee Increase</span>
            <span className="font-semibold">
              ${result.stressedNet.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between border-t pt-3">
            <span>Profit Change</span>
            <span className="font-semibold">
              ${result.delta.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <div className="max-w-2xl space-y-3">
        <h2 className="text-xl font-semibold">How it works</h2>
        <p className="text-gray-600">
          The calculator applies a fee shock to your current processing rate and
          compares baseline profit to stressed profit outcomes.
        </p>
      </div>
    </div>
  );
}
