"use client";

import { useMemo, useState } from "react";

export default function IsOnlinePaymentProcessingWorthItCalculator() {
  const [baselineRevenue, setBaselineRevenue] = useState("20000");
  const [conversionLiftPct, setConversionLiftPct] = useState("5");

  const [transactions, setTransactions] = useState("400");
  const [feeRatePct, setFeeRatePct] = useState("2.9");
  const [fixedFee, setFixedFee] = useState("0.30");

  const [operationalCost, setOperationalCost] = useState("150");

  const result = useMemo(() => {
    const baseRev = Number(baselineRevenue);
    const liftPct = Number(conversionLiftPct);
    const tx = Number(transactions);
    const ratePct = Number(feeRatePct);
    const fixed = Number(fixedFee);
    const ops = Number(operationalCost);

    const valid =
      baseRev > 0 &&
      liftPct >= 0 &&
      tx > 0 &&
      ratePct >= 0 &&
      fixed >= 0 &&
      ops >= 0 &&
      isFinite(baseRev) &&
      isFinite(liftPct) &&
      isFinite(tx) &&
      isFinite(ratePct) &&
      isFinite(fixed) &&
      isFinite(ops);

    if (!valid) return null;

    // Added revenue from conversion lift
    const addedRevenue = baseRev * (liftPct / 100);
    const newRevenue = baseRev + addedRevenue;

    // Estimate processing fees on NEW revenue (simplification)
    const percentFees = (newRevenue * ratePct) / 100;
    const fixedFees = tx * fixed;
    const totalFees = percentFees + fixedFees;

    const totalCosts = totalFees + ops;
    const netImpact = addedRevenue - totalCosts;

    // Break-even conversion lift: addedRevenue = totalCosts => baseRev*(x/100) = totalCosts
    const breakEvenLiftPct = (totalCosts / baseRev) * 100;

    return {
      addedRevenue,
      newRevenue,
      percentFees,
      fixedFees,
      totalFees,
      totalCosts,
      netImpact,
      breakEvenLiftPct,
    };
  }, [
    baselineRevenue,
    conversionLiftPct,
    transactions,
    feeRatePct,
    fixedFee,
    operationalCost,
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">
          Is Online Payment Processing Worth It Calculator
        </h1>
        <p className="mt-2 text-gray-600">
          Estimate whether online payment processing is worth it by comparing
          potential revenue lift against processing and operational costs.
        </p>
      </div>

      <div className="grid gap-6 max-w-xl">
        <div>
          <label className="block font-medium">
            Baseline Monthly Revenue (without online payments)
          </label>
          <input
            type="number"
            value={baselineRevenue}
            onChange={(e) => setBaselineRevenue(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Your current revenue before offering the online payment option.
          </p>
        </div>

        <div>
          <label className="block font-medium">Estimated Conversion Lift (%)</label>
          <input
            type="number"
            value={conversionLiftPct}
            onChange={(e) => setConversionLiftPct(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Expected revenue increase after adding online payments (estimate).
          </p>
        </div>

        <div className="rounded-lg border p-4 space-y-4">
          <div className="font-semibold">Processing Fee Inputs</div>

          <div>
            <label className="block font-medium">Monthly Transactions</label>
            <input
              type="number"
              value={transactions}
              onChange={(e) => setTransactions(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium">Fee Rate (%)</label>
            <input
              type="number"
              value={feeRatePct}
              onChange={(e) => setFeeRatePct(e.target.value)}
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

        <div>
          <label className="block font-medium">Estimated Monthly Operational Cost</label>
          <input
            type="number"
            value={operationalCost}
            onChange={(e) => setOperationalCost(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Tools, admin time, fraud prevention, disputes, etc.
          </p>
        </div>
      </div>

      {result && (
        <div className="max-w-2xl rounded-lg border p-6 space-y-3">
          <div className="flex justify-between">
            <span>Added Revenue (from lift)</span>
            <span className="font-semibold">${result.addedRevenue.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Processing Fees (percentage)</span>
            <span className="font-semibold">${result.percentFees.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Processing Fees (fixed)</span>
            <span className="font-semibold">${result.fixedFees.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Total Processing Fees</span>
            <span className="font-semibold">${result.totalFees.toFixed(2)}</span>
          </div>

          <div className="flex justify-between border-t pt-3">
            <span>Total Monthly Costs (fees + ops)</span>
            <span className="font-semibold">${result.totalCosts.toFixed(2)}</span>
          </div>

          <div className="text-sm text-gray-700">
            Net impact:{" "}
            <strong>
              {result.netImpact >= 0 ? "+" : ""}
              ${result.netImpact.toFixed(2)} / month
            </strong>
          </div>

          <p className="text-sm text-gray-600">
            Break-even conversion lift:{" "}
            <strong>{result.breakEvenLiftPct.toFixed(2)}%</strong>
          </p>
        </div>
      )}

      <div className="max-w-2xl space-y-3">
        <h2 className="text-xl font-semibold">How it works</h2>
        <p className="text-gray-600">
          The calculator estimates added revenue from conversion lift, then
          subtracts processing fees and operational costs to show net impact.
          Use it for directional decision-making.
        </p>
      </div>

      <div className="max-w-2xl text-xs text-gray-500 leading-relaxed border-t pt-4">
        This tool provides estimates for comparison purposes only. Real outcomes
        vary by business, customer mix, payment methods, and provider terms.
      </div>
    </div>
  );
}
