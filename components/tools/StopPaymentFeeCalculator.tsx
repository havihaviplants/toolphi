"use client";

import { useMemo, useState } from "react";

function safe(n: number) {
  return Number.isFinite(n) ? n : 0;
}

export default function StopPaymentFeeCalculator() {
  const [fee, setFee] = useState<number>(35);
  const [count, setCount] = useState<number>(2);

  const total = useMemo(() => {
    return Math.max(0, safe(fee)) * Math.max(0, safe(count));
  }, [fee, count]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">
            Stop Payment Fee per Request ($)
          </label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={fee}
            onChange={(e) => setFee(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Number of Stop Payment Requests
          </label>
          <input
            className="input"
            type="number"
            min={0}
            step="1"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          Banks charge stop payment fees when you request to block a check or automatic withdrawal.
          Fees vary by bank and request type.
        </p>

        <p className="font-semibold">
          Total Stop Payment Fees: ${total.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
