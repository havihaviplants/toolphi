"use client";

import { useMemo, useState } from "react";

export default function OnlinePaymentFeeImpactOnProfitMarginCalculator() {
  const [monthlyRevenue, setMonthlyRevenue] = useState("60000");
  const [grossMarginPct, setGrossMarginPct] = useState("35");
  const [transactions, setTransactions] = useState("1200");
  const [feeRatePct, setFeeRatePct] = useState("2.9");
  const [fixedFee, setFixedFee] = useState("0.30");

  const result = useMemo(() => {
    const rev = Number(monthlyRevenue);
    const gmPct = Number(grossMarginPct);
    const tx = Number(transactions);
    const ratePct = Number(feeRatePct);
    const fixed = Number(fixedFee);

    const valid =
      rev > 0 &&
      gmPct >= 0 &&
      gmPct <= 100 &&
      tx > 0 &&
      ratePct >= 0 &&
      fixed >= 0 &&
      isFinite(rev) &&
      isFinite(gmPct) &&
      isFinite(tx) &&
      isFinite(ratePct) &&
      isFinite(fixed);

    if (!valid) return null;

    const grossProfitBeforeFees = rev * (gmPct / 100);

    const percentFees = (rev * ratePct) / 100;
    const fixedFees = tx * fixed;
    const totalFees = percentFees + fixedFees;

    const grossProfitAfterFees = grossProfitBeforeFees - totalFees;

    const marginBefore = (grossProfitBeforeFees / rev) * 100;
    const marginAfter = (grossProfitAfterFees / rev) * 100;
    const marginDropPts = marginBefore - marginAfter;

    return {
      grossProfitBeforeFees,
      percentFees,
      fixedFees,
      totalFees,
      grossProfitAfterFees,
      marginBefore,
      marginAfter,
      marginDropPts,
    };
  }, [monthlyRevenue, grossMarginPct, transactions, feeRatePct, fixedFee]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">
          Online Payment Fee Impact on Profit Margin Calculator
        </h1>
        <p className="mt-2 text-gray-600">
          Estimate how payment processing fees reduce your profit and profit
          margin based on revenue, gross margin, and fee structure.
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
        </div>

        <div>
          <label className="block font-medium">Gross Margin (%)</label>
          <input
            type="number"
            value={grossMarginPct}
            onChange={(e) => setGrossMarginPct(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Gross margin before payment fees (profit after COGS, before fees).
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
        </div>

        <div className="rounded-lg border p-4 space-y-4">
          <div className="font-semibold">Processing Fee Inputs</div>

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
      </div>

      {result && (
        <div className="max-w-2xl rounded-lg border p-6 space-y-3">
          <div className="flex justify-between">
            <span>Gross Profit (before fees)</span>
            <span className="font-semibold">
              ${result.grossProfitBeforeFees.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Percentage Fees</span>
            <span className="font-semibold">${result.percentFees.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Fixed Fees</span>
            <span className="font-semibold">${result.fixedFees.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Total Processing Fees</span>
            <span className="font-semibold">${result.totalFees.toFixed(2)}</span>
          </div>

          <div className="flex justify-between border-t pt-3">
            <span>Gross Profit (after fees)</span>
            <span className="font-semibold">
              ${result.grossProfitAfterFees.toFixed(2)}
            </span>
          </div>

          <div className="text-sm text-gray-700">
            Margin before fees: <strong>{result.marginBefore.toFixed(2)}%</strong>
            <br />
            Margin after fees: <strong>{result.marginAfter.toFixed(2)}%</strong>
            <br />
            Margin drop: <strong>{result.marginDropPts.toFixed(2)} pts</strong>
          </div>
        </div>
      )}

      <div className="max-w-2xl space-y-3">
        <h2 className="text-xl font-semibold">How it works</h2>
        <p className="text-gray-600">
          This calculator estimates gross profit from your gross margin, then
          subtracts payment processing fees to show the margin impact.
        </p>
      </div>

      <div className="max-w-2xl space-y-4">
        <h2 className="text-xl font-semibold">FAQ</h2>

        <div>
          <h3 className="font-medium">Is gross margin the same as net margin?</h3>
          <p className="text-gray-600">
            No. Gross margin excludes operating expenses. This tool focuses on
            the fee impact at the gross profit level.
          </p>
        </div>

        <div>
          <h3 className="font-medium">What if I have multiple payment methods?</h3>
          <p className="text-gray-600">
            Use a blended average fee rate and fixed fee to approximate your mix.
          </p>
        </div>
      </div>
    </div>
  );
}
