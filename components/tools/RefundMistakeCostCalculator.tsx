"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}

function money(v: number) {
  const x = n(v);
  return x.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function RefundMistakeCostCalculator() {
  const [amount, setAmount] = useState<number>(500);
  const [fee, setFee] = useState<number>(15);
  const [delayDays, setDelayDays] = useState<number>(20);
  const [annualRate, setAnnualRate] = useState<number>(6);

  const r = useMemo(() => {
    const a = Math.max(0, n(amount));
    const f = Math.max(0, n(fee));
    const d = Math.max(0, n(delayDays));
    const r = Math.max(0, n(annualRate)) / 100;

    const interestLoss = a * r * (d / 365);
    const totalCost = f + interestLoss;

    return { a, f, d, interestLoss, totalCost };
  }, [amount, fee, delayDays, annualRate]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1>Refund Mistake Cost Calculator</h1>
        <p className="text-sm text-muted-foreground">
          Calculate the financial impact of a refund mistake, including fees and
          delay-related interest loss.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Refund amount affected</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Correction / reprocessing fee</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            step="0.01"
            value={fee}
            onChange={(e) => setFee(Number(e.target.value))}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Extra delay (days)</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            step="1"
            value={delayDays}
            onChange={(e) => setDelayDays(Number(e.target.value))}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Annual interest / opportunity rate (%)</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            step="0.1"
            value={annualRate}
            onChange={(e) => setAnnualRate(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="rounded-xl border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Interest / opportunity loss</span>
          <span className="text-sm font-medium">${money(r.interestLoss)}</span>
        </div>

        <div className="pt-2 border-t flex items-center justify-between">
          <span className="text-sm font-semibold">Total mistake cost</span>
          <span className="text-sm font-semibold">${money(r.totalCost)}</span>
        </div>

        <p className="text-xs text-muted-foreground">
          Uses a simple interest estimate: amount × rate × (days / 365).
        </p>
      </div>
    </div>
  );
}
