"use client";

import { useMemo, useState } from "react";

function clampNonNegative(n: number) {
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

export default function HourlyPayCalculator() {
  const [hourlyRate, setHourlyRate] = useState<number>(18);
  const [hoursWorked, setHoursWorked] = useState<number>(42);
  const [unpaidBreakHours, setUnpaidBreakHours] = useState<number>(2);
  const [extraEarnings, setExtraEarnings] = useState<number>(35); // tips/bonus

  const results = useMemo(() => {
    const rate = clampNonNegative(hourlyRate);
    const hours = clampNonNegative(hoursWorked);
    const breaks = clampNonNegative(unpaidBreakHours);
    const extra = clampNonNegative(extraEarnings);

    const paidHours = Math.max(0, hours - breaks);
    const basePay = paidHours * rate;
    const grossPay = basePay + extra;

    const effectiveHourly =
      paidHours > 0 ? grossPay / paidHours : 0;

    // Show "lost pay" from unpaid breaks (if any)
    const breakPayLoss = Math.min(hours, breaks) * rate;

    return { paidHours, basePay, extra, grossPay, effectiveHourly, breakPayLoss };
  }, [hourlyRate, hoursWorked, unpaidBreakHours, extraEarnings]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-base font-semibold">Inputs</h2>
        <p className="text-sm opacity-70">
          Use this to estimate gross pay for a week or pay period before taxes and deductions.
        </p>
      </div>

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
          <label className="block text-sm font-medium">Hours Worked</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.25"
            value={hoursWorked}
            onChange={(e) => setHoursWorked(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">Total hours on your schedule (including breaks).</p>
        </div>

        <div>
          <label className="block text-sm font-medium">Unpaid Break Hours (optional)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.25"
            value={unpaidBreakHours}
            onChange={(e) => setUnpaidBreakHours(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">If breaks are paid, set this to 0.</p>
        </div>

        <div>
          <label className="block text-sm font-medium">Extra Earnings (tips/bonus)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={extraEarnings}
            onChange={(e) => setExtraEarnings(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">Optional: add tips, shift bonus, commissions, etc.</p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="space-y-1">
          <h2 className="text-base font-semibold">Results</h2>
          <p className="text-sm opacity-70">
            This is gross pay. Taxes and payroll deductions can significantly change take-home pay.
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-lg font-semibold">Gross Pay: ${results.grossPay.toFixed(2)}</p>
          <p>Paid Hours: {results.paidHours.toFixed(2)} hours</p>
          <p>Base Pay (paid hours × rate): ${results.basePay.toFixed(2)}</p>
          <p>Extra Earnings: ${results.extra.toFixed(2)}</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 pt-2">
          <div className="rounded-md border p-3">
            <p className="text-sm opacity-70">Break pay “lost” (if unpaid)</p>
            <p className="font-semibold">${results.breakPayLoss.toFixed(2)}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-sm opacity-70">Effective hourly rate (incl. extra)</p>
            <p className="font-semibold">${results.effectiveHourly.toFixed(2)} / hour</p>
          </div>
        </div>

        <p className="text-xs opacity-70">
          Next step: If you need after-tax estimates, use your take-home pay / after-tax salary calculators.
        </p>
      </div>
    </div>
  );
}
