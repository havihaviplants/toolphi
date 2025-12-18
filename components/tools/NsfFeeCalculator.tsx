"use client";

import { useMemo, useState } from "react";

export default function NsfFeeCalculator() {
  const [feePerEvent, setFeePerEvent] = useState<number>(30);
  const [eventCount, setEventCount] = useState<number>(2);

  const { monthlyTotal, yearlyTotal } = useMemo(() => {
    const fee = Math.max(0, Number.isFinite(feePerEvent) ? feePerEvent : 0);
    const count = Math.max(0, Number.isFinite(eventCount) ? eventCount : 0);

    const monthly = fee * count;
    return {
      monthlyTotal: monthly,
      yearlyTotal: monthly * 12,
    };
  }, [feePerEvent, eventCount]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">NSF Fee (per event) ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={feePerEvent}
            onChange={(e) => setFeePerEvent(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Number of NSF Events (per month)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="1"
            value={eventCount}
            onChange={(e) => setEventCount(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          Assumes the event count is a monthly number.
        </p>
        <p className="font-semibold">Total NSF Fees (Monthly): ${monthlyTotal.toFixed(2)}</p>
        <p>Estimated NSF Fees (Yearly): ${yearlyTotal.toFixed(2)}</p>
        <p className="text-sm opacity-80">
          Total = fee × events. Banks may cap fees per day; use an average if needed.
        </p>
      </div>
    </div>
  );
}
