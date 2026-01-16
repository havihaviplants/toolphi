"use client";

import { useMemo, useState } from "react";

export default function OnlinePaymentFeeStressTestCalculator() {
  // Baseline business
  const [revenue, setRevenue] = useState("80000");
  const [transactions, setTransactions] = useState("1600");
  const [grossMarginPct, setGrossMarginPct] = useState("35");

  // Baseline fees
  const [feeRatePct, setFeeRatePct] = useState("2.9");
  const [fixedFee, setFixedFee] = useState("0.30");

  // Stress scenario knobs
  const [feeRateIncreasePts, setFeeRateIncreasePts] = useState("0.4"); // +0.4 percentage points
  const [refundRatePct, setRefundRatePct] = useState("3"); // % of revenue refunded
  const [revenueChangePct, setRevenueChangePct] = useState("-10"); // revenue shock

  const result = useMemo(() => {
    const rev = Number(revenue);
    const tx = Number(transactions);
    const gm = Number(grossMarginPct);

    const baseRate = Number(feeRatePct);
    const baseFixed = Number(fixedFee);

    const incPts = Number(feeRateIncreasePts);
    const refundPct = Number(refundRatePct);
    const revChgPct = Number(revenueChangePct);

    const valid =
      rev > 0 &&
      tx > 0 &&
      gm >= 0 &&
      gm <= 100 &&
      baseRate >= 0 &&
      baseFixed >= 0 &&
      incPts >= 0 &&
      refundPct >= 0 &&
      refundPct <= 100 &&
      isFinite(rev) &&
      isFinite(tx) &&
      isFinite(gm) &&
      isFinite(baseRate) &&
      isFinite(baseFixed) &&
      isFinite(incPts) &&
      isFinite(refundPct) &&
      isFinite(revChgPct);

    if (!valid) return null;

    const grossProfitBase = rev * (gm / 100);
    const basePercentFees = (rev * baseRate) / 100;
    const baseFixedFees = tx * baseFixed;
    const baseTotalFees = basePercentFees + baseFixedFees;
    const baseProfitAfterFees = grossProfitBase - baseTotalFees;
    const baseMarginAfterFees = (baseProfitAfterFees / rev) * 100;
    const baseEffectiveFeeRate = (baseTotalFees / rev) * 100;

    // Stress scenario revenue change
    const stressedRevenue = rev * (1 + revChgPct / 100);

    // Refunds reduce revenue and may also incur processing costs depending on provider.
    // Here we model refunds as revenue loss only (conservative for profit).
    const refundLoss = stressedRevenue * (refundPct / 100);
    const netRevenueAfterRefunds = stressedRevenue - refundLoss;

    // Stressed fee rate
    const stressedRate = baseRate + incPts;

    // Assume transaction count scales with revenue (simple proxy)
    const stressedTx = tx * (stressedRevenue / rev);

    const stressedGrossProfit = netRevenueAfterRefunds * (gm / 100);

    const stressedPercentFees = (netRevenueAfterRefunds * stressedRate) / 100;
    const stressedFixedFees = stressedTx * baseFixed;
    const stressedTotalFees = stressedPercentFees + stressedFixedFees;

    const stressedProfitAfterFees = stressedGrossProfit - stressedTotalFees;
    const stressedMarginAfterFees =
      (stressedProfitAfterFees / netRevenueAfterRefunds) * 100;

    const stressedEffectiveFeeRate =
      (stressedTotalFees / netRevenueAfterRefunds) * 100;

    return {
      // Baseline
      grossProfitBase,
      baseTotalFees,
      baseProfitAfterFees,
      baseMarginAfterFees,
      baseEffectiveFeeRate,

      // Stress
      stressedRevenue,
      refundLoss,
      netRevenueAfterRefunds,
      stressedTx,
      stressedRate,
      stressedGrossProfit,
      stressedTotalFees,
      stressedProfitAfterFees,
      stressedMarginAfterFees,
      stressedEffectiveFeeRate,

      // Deltas
      profitDelta: stressedProfitAfterFees - baseProfitAfterFees,
      marginDelta: stressedMarginAfterFees - baseMarginAfterFees,
    };
  }, [
    revenue,
    transactions,
    grossMarginPct,
    feeRatePct,
    fixedFee,
    feeRateIncreasePts,
    refundRatePct,
    revenueChangePct,
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">
          Online Payment Fee Stress Test Calculator
        </h1>
        <p className="mt-2 text-gray-600">
          Stress test your payment processing costs under fee increases, refunds,
          and revenue shocks to see profit and margin impact.
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <div className="rounded-lg border p-4 space-y-4">
          <div className="font-semibold">Baseline Inputs</div>

          <div className="grid gap-6 md:grid-cols-2">
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
              <label className="block font-medium">Monthly Transactions</label>
              <input
                type="number"
                value={transactions}
                onChange={(e) => setTransactions(e.target.value)}
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
                Gross margin before processing fees.
              </p>
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
        </div>

        <div className="rounded-lg border p-4 space-y-4">
          <div className="font-semibold">Stress Scenario</div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block font-medium">Fee Rate Increase (pts)</label>
              <input
                type="number"
                value={feeRateIncreasePts}
                onChange={(e) => setFeeRateIncreasePts(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                Example: 0.4 means +0.4 percentage points.
              </p>
            </div>

            <div>
              <label className="block font-medium">Refund Rate (% of revenue)</label>
              <input
                type="number"
                value={refundRatePct}
                onChange={(e) => setRefundRatePct(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label className="block font-medium">Revenue Change (%)</label>
              <input
                type="number"
                value={revenueChangePct}
                onChange={(e) => setRevenueChangePct(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                Example: -10 means revenue drops 10%.
              </p>
            </div>
          </div>
        </div>
      </div>

      {result && (
        <div className="max-w-3xl rounded-lg border p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="font-semibold">Baseline</div>
              <div className="flex justify-between text-sm">
                <span>Total Fees</span>
                <span className="font-semibold">${result.baseTotalFees.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Profit (after fees)</span>
                <span className="font-semibold">${result.baseProfitAfterFees.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Margin (after fees)</span>
                <span className="font-semibold">{result.baseMarginAfterFees.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Effective Fee Rate</span>
                <span className="font-semibold">{result.baseEffectiveFeeRate.toFixed(2)}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-semibold">Stressed Scenario</div>
              <div className="flex justify-between text-sm">
                <span>Net Revenue (after refunds)</span>
                <span className="font-semibold">${result.netRevenueAfterRefunds.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Fees</span>
                <span className="font-semibold">${result.stressedTotalFees.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Profit (after fees)</span>
                <span className="font-semibold">${result.stressedProfitAfterFees.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Margin (after fees)</span>
                <span className="font-semibold">{result.stressedMarginAfterFees.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Effective Fee Rate</span>
                <span className="font-semibold">{result.stressedEffectiveFeeRate.toFixed(2)}%</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 text-sm text-gray-700 space-y-2">
            <div>
              Profit change:{" "}
              <strong>
                {result.profitDelta >= 0 ? "+" : ""}
                ${result.profitDelta.toFixed(2)}
              </strong>
            </div>
            <div>
              Margin change:{" "}
              <strong>
                {result.marginDelta >= 0 ? "+" : ""}
                {result.marginDelta.toFixed(2)} pts
              </strong>
            </div>
          </div>

          <div className="text-xs text-gray-500 leading-relaxed border-t pt-4">
            This tool provides estimates for scenario planning only. Actual refund handling and fee
            policies vary by provider and contract terms.
          </div>
        </div>
      )}

      <div className="max-w-3xl space-y-3">
        <h2 className="text-xl font-semibold">How it works</h2>
        <p className="text-gray-600">
          The stress test applies revenue shocks, refund loss assumptions, and fee rate increases to
          estimate how processing costs affect profit and margins under downside scenarios.
        </p>
      </div>
    </div>
  );
}
