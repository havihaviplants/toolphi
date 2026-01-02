"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}

function money(v: number) {
  const x = n(v);
  return x.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function IsClaimingARefundWorthItCalculator() {
  const [expectedRefund, setExpectedRefund] = useState<number>(120);
  const [fees, setFees] = useState<number>(5);
  const [timeHours, setTimeHours] = useState<number>(1.5);
  const [hourlyValue, setHourlyValue] = useState<number>(25);
  const [approvalProb, setApprovalProb] = useState<number>(80);

  const r = useMemo(() => {
    const refund = Math.max(0, n(expectedRefund));
    const fee = Math.max(0, n(fees));
    const hours = Math.max(0, n(timeHours));
    const hourly = Math.max(0, n(hourlyValue));
    const p = Math.min(100, Math.max(0, n(approvalProb))) / 100;

    const timeCost = hours * hourly;
    const expectedValue = refund * p;
    const net = expectedValue - fee - timeCost;

    let verdict: "Worth it" | "Not worth it" | "Close call" = "Close call";
    if (net > 0) verdict = "Worth it";
    if (net < 0) verdict = "Not worth it";

    return { refund, fee, hours, hourly, p, timeCost, expectedValue, net, verdict };
  }, [expectedRefund, fees, timeHours, hourlyValue, approvalProb]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1>Is Claiming a Refund Worth It Calculator</h1>
        <p className="text-sm text-muted-foreground">
          Estimate whether requesting a refund is worth it after fees, time cost, and approval probability.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Expected refund amount</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            step="0.01"
            value={expectedRefund}
            onChange={(e) => setExpectedRefund(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">How much you expect to receive if approved.</p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Fees to claim the refund</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            step="0.01"
            value={fees}
            onChange={(e) => setFees(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">Shipping, processing, filing, restocking, etc.</p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Time required (hours)</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            step="0.1"
            value={timeHours}
            onChange={(e) => setTimeHours(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">Time spent contacting support, forms, packing, etc.</p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Your hourly value</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            step="0.5"
            value={hourlyValue}
            onChange={(e) => setHourlyValue(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">Use your wage, freelance rate, or a personal value.</p>
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
          <p className="text-xs text-muted-foreground">If unsure, use 50–80% as a starting point.</p>
        </div>
      </div>

      <div className="rounded-xl border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Recommendation</div>
          <div className="text-sm font-semibold">{r.verdict}</div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Expected value (refund × probability)</span>
            <span className="text-sm font-medium">${money(r.expectedValue)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Fees</span>
            <span className="text-sm font-medium">-${money(r.fee)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Time cost (hours × hourly value)</span>
            <span className="text-sm font-medium">-${money(r.timeCost)}</span>
          </div>

          <div className="pt-2 border-t flex items-center justify-between">
            <span className="text-sm font-semibold">Expected net benefit</span>
            <span className="text-sm font-semibold">
              {r.net >= 0 ? `$${money(r.net)}` : `-$${money(Math.abs(r.net))}`}
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          This is an estimate using expected value. Even if it’s “not worth it,” you might still request a refund for
          fairness or policy reasons.
        </p>
      </div>
    </div>
  );
}
