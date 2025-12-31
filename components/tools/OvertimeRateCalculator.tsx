"use client";

import { useMemo, useState } from "react";

function clampNonNegative(n: number) {
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

export default function OvertimeRateCalculator() {
  const [baseRate, setBaseRate] = useState<number>(22);
  const [multiplier, setMultiplier] = useState<number>(1.5);

  const results = useMemo(() => {
    const base = clampNonNegative(baseRate);
    const m = Math.max(1, clampNonNegative(multiplier));

    const overtimeRate = base * m;
    const premiumPerHour = overtimeRate - base;
    const percentIncrease = base > 0 ? (premiumPerHour / base) * 100 : 0;

    return { overtimeRate, premiumPerHour, percentIncrease };
  }, [baseRate, multiplier]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Base Hourly Rate ($/hour)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={baseRate}
            onChange={(e) => setBaseRate(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Overtime Multiplier</label>
          <input
            className="input"
            type="number"
            min={1}
            step="0.05"
            value={multiplier}
            onChange={(e) => setMultiplier(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">Common values: 1.5 (time-and-a-half), 2.0 (double time)</p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          Tip: This calculates your overtime hourly rate. Use the Overtime Pay Calculator to estimate total pay with hours worked.
        </p>
        <p className="font-semibold">Overtime Rate: ${results.overtimeRate.toFixed(2)} / hour</p>
        <p>Premium per Overtime Hour: ${results.premiumPerHour.toFixed(2)}</p>
        <p>Increase vs Base Rate: {results.percentIncrease.toFixed(1)}%</p>
      </div>
    </div>
  );
}
