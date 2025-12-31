"use client";

import { useMemo, useState } from "react";

function clampNonNegative(n: number) {
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

export default function OvertimePayCalculator() {
  const [hourlyRate, setHourlyRate] = useState<number>(20);
  const [regularHours, setRegularHours] = useState<number>(40);
  const [overtimeHours, setOvertimeHours] = useState<number>(5);
  const [doubleTimeHours, setDoubleTimeHours] = useState<number>(0);

  const [overtimeMultiplier, setOvertimeMultiplier] = useState<number>(1.5);
  const [doubleTimeMultiplier, setDoubleTimeMultiplier] = useState<number>(2);

  const results = useMemo(() => {
    const rate = clampNonNegative(hourlyRate);
    const regH = clampNonNegative(regularHours);
    const otH = clampNonNegative(overtimeHours);
    const dtH = clampNonNegative(doubleTimeHours);

    const otM = Math.max(1, clampNonNegative(overtimeMultiplier));
    const dtM = Math.max(1, clampNonNegative(doubleTimeMultiplier));

    const regularPay = rate * regH;
    const overtimePay = rate * otH * otM;
    const doubleTimePay = rate * dtH * dtM;

    const totalHours = regH + otH + dtH;
    const totalPay = regularPay + overtimePay + doubleTimePay;

    // "Premium" part (extra above base rate)
    const overtimePremium = rate * otH * Math.max(0, otM - 1);
    const doubleTimePremium = rate * dtH * Math.max(0, dtM - 1);
    const totalPremium = overtimePremium + doubleTimePremium;

    const effectiveHourly = totalHours > 0 ? totalPay / totalHours : 0;

    return {
      regularPay,
      overtimePay,
      doubleTimePay,
      totalPay,
      totalHours,
      totalPremium,
      effectiveHourly,
    };
  }, [
    hourlyRate,
    regularHours,
    overtimeHours,
    doubleTimeHours,
    overtimeMultiplier,
    doubleTimeMultiplier,
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Hourly Rate ($/hour)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Regular Hours</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.25"
            value={regularHours}
            onChange={(e) => setRegularHours(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Overtime Hours (1.5x)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.25"
            value={overtimeHours}
            onChange={(e) => setOvertimeHours(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">Hours paid at time-and-a-half (default 1.5×).</p>
        </div>

        <div>
          <label className="block text-sm font-medium">Double-Time Hours (2x)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.25"
            value={doubleTimeHours}
            onChange={(e) => setDoubleTimeHours(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">Only if your job/location uses double time.</p>
        </div>

        <div>
          <label className="block text-sm font-medium">Overtime Multiplier</label>
          <input
            className="input"
            type="number"
            min={1}
            step="0.05"
            value={overtimeMultiplier}
            onChange={(e) => setOvertimeMultiplier(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">Common values: 1.5, 2.0</p>
        </div>

        <div>
          <label className="block text-sm font-medium">Double-Time Multiplier</label>
          <input
            className="input"
            type="number"
            min={1}
            step="0.05"
            value={doubleTimeMultiplier}
            onChange={(e) => setDoubleTimeMultiplier(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">Usually 2.0 (double time).</p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          Tip: Rules vary by location and job type. This tool estimates pay based on hours and multipliers you enter.
        </p>
        <p className="font-semibold">Total Pay: ${results.totalPay.toFixed(2)}</p>
        <p>Regular Pay: ${results.regularPay.toFixed(2)}</p>
        <p>Overtime Pay: ${results.overtimePay.toFixed(2)}</p>
        <p>Double-Time Pay: ${results.doubleTimePay.toFixed(2)}</p>
        <p className="pt-2">
          Overtime Premium (extra earned): <strong>${results.totalPremium.toFixed(2)}</strong>
        </p>
        <p>
          Effective Hourly Rate: <strong>${results.effectiveHourly.toFixed(2)}</strong> / hour
        </p>
      </div>
    </div>
  );
}
