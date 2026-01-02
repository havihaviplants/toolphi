"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}

function money(v: number) {
  const x = n(v);
  return x.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function RefundDenialImpactCalculator() {
  const [refundAmount, setRefundAmount] = useState<number>(150);
  const [nonRefundableFees, setNonRefundableFees] = useState<number>(10);
  const [timeHours, setTimeHours] = useState<number>(2);
  const [hourlyValue, setHourlyValue] = useState<number>(20);
  const [approvalProb, setApprovalProb] = useState<number>(60);

  const r = useMemo(() => {
    const amount = Math.max(0, n(refundAmount));
    const fees = Math.max(0, n(nonRefundableFees));
    const hours = Math.max(0, n(timeHours));
    const hourly = Math.max(0, n(hourlyValue));
    const p = Math.min(100, Math.max(0, n(approvalProb))) / 100;

    const timeCost = hours * hourly;

    // If denied, you lose: refund amount + sunk fees + time cost
    const denialLoss = amount + fees + timeCost;

    // Expected loss from denial risk (probability of denial = 1 - p)
    const expectedLoss = denialLoss * (1 - p);

    // Expected outcome if you attempt (expected refund value minus sunk costs)
    const expectedNet = amount * p - fees - timeCost;

    let verdict: "Low risk" | "Moderate risk" | "High risk" = "Moderate risk";
    if (expectedLoss <= denialLoss * 0.2) verdict = "Low risk";
    if (expectedLoss >= denialLoss * 0.5) verdict = "High risk";

    return { amount, fees, hours, hourly, p, timeCost, denialLoss, expectedLoss, expectedNet, verdict };
  }, [refundAmount, nonRefundableFees, timeHours, hourlyValue, approvalProb]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1>Refund Denial Impact Calculator</h1>
        <p className="text-sm text-muted-foreground">
          Estimate the impact if your refund is denied, including sunk fees, time cost, and expected loss based on approval probability.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Refund amount</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            step="0.01"
            value={refundAmount}
            onChange={(e) => setRefundAmount(Number(e.target.value))}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Non-refundable fees</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            step="0.01"
            value={nonRefundableFees}
            onChange={(e) => setNonRefundableFees(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">Shipping, restocking, filing, etc.</p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Time spent (hours)</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            step="0.1"
            value={timeHours}
            onChange={(e) => setTimeHours(Number(e.target.value))}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Hourly value</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            step="0.5"
            value={hourlyValue}
            onChange={(e) => setHourlyValue(Number(e.target.value))}
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium">Approval probability (%)</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            max={100}
            step="1"
            value={approvalProb}
            onChange={(e) => setApprovalProb(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="rounded-xl border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Denial loss (if rejected)</span>
          <span className="text-sm font-medium">${money(r.denialLoss)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Expected loss (denial risk)</span>
          <span className="text-sm font-medium">${money(r.expectedLoss)}</span>
        </div>

        <div className="pt-2 border-t flex items-center justify-between">
          <span className="text-sm font-semibold">Expected net outcome</span>
          <span className="text-sm font-semibold">
            {r.expectedNet >= 0 ? `$${money(r.expectedNet)}` : `-$${money(Math.abs(r.expectedNet))}`}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          Risk level: <span className="font-medium">{r.verdict}</span>. Expected loss uses (1 − approval probability).
        </p>
      </div>
    </div>
  );
}
