"use client";

import { useMemo, useState } from "react";

function safeNum(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function RefundDelayCostCalculator() {
  const [refundAmount, setRefundAmount] = useState<number>(2000);
  const [delayDays, setDelayDays] = useState<number>(30);
  const [annualRate, setAnnualRate] = useState<number>(6);

  const r = useMemo(() => {
    const amount = Math.max(0, safeNum(refundAmount));
    const days = Math.max(0, safeNum(delayDays));
    const rate = Math.max(0, safeNum(annualRate));

    const loss = amount * (rate / 100) * (days / 365);
    const dailyLoss = days > 0 ? loss / days : 0;

    return { amount, days, rate, loss, dailyLoss };
  }, [refundAmount, delayDays, annualRate]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Refund amount</label>
          <input
            className="input"
            type="number"
            value={refundAmount}
            onChange={(e) => setRefundAmount(Number(e.target.value))}
            min={0}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Delay (days)</label>
          <input
            className="input"
            type="number"
            value={delayDays}
            onChange={(e) => setDelayDays(Number(e.target.value))}
            min={0}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">
            Annual interest / opportunity rate (%)
          </label>
          <input
            className="input"
            type="number"
            value={annualRate}
            onChange={(e) => setAnnualRate(Number(e.target.value))}
            min={0}
          />
          <p className="text-xs opacity-70 mt-1">
            Use a savings APY, credit card APR, or your expected return.
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          Estimated value lost due to delayed access to your money.
        </p>

        <p className="font-semibold">Estimated loss: ${r.loss.toFixed(2)}</p>
        <p className="text-sm opacity-80">Per-day loss: ${r.dailyLoss.toFixed(2)} / day</p>

        <p className="text-xs opacity-70">
          This uses a simple interest approximation: amount × rate × (days / 365).
        </p>
      </div>
    </div>
  );
}
