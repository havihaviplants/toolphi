"use client";

import { useMemo, useState } from "react";

type Frequency = "weekly" | "biweekly" | "semimonthly" | "monthly";

function clampNonNegative(n: number) {
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function periodsPerYear(freq: Frequency) {
  switch (freq) {
    case "weekly":
      return 52;
    case "biweekly":
      return 26;
    case "semimonthly":
      return 24;
    case "monthly":
      return 12;
    default:
      return 26;
  }
}

export default function PtoAccrualCalculator() {
  const [frequency, setFrequency] = useState<Frequency>("biweekly");
  const [hoursPerPeriod, setHoursPerPeriod] = useState<number>(4);
  const [periodCount, setPeriodCount] = useState<number>(13); // ~6 months biweekly
  const [hoursPerDay, setHoursPerDay] = useState<number>(8);

  const results = useMemo(() => {
    const hpp = clampNonNegative(hoursPerPeriod);
    const periods = clampNonNegative(periodCount);
    const hpd = Math.max(0.1, clampNonNegative(hoursPerDay));

    const totalHours = hpp * periods;
    const totalDays = totalHours / hpd;

    const ppy = periodsPerYear(frequency);
    const annualHours = hpp * ppy;
    const annualDays = annualHours / hpd;

    return { totalHours, totalDays, annualHours, annualDays, ppy };
  }, [frequency, hoursPerPeriod, periodCount, hoursPerDay]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-base font-semibold">Inputs</h2>
        <p className="text-sm opacity-70">
          Enter your PTO accrual policy to estimate how many hours (and days) you’ll earn over time.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Accrual Frequency</label>
          <select
            className="input"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as Frequency)}
          >
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly (every 2 weeks)</option>
            <option value="semimonthly">Semi-monthly (twice a month)</option>
            <option value="monthly">Monthly</option>
          </select>
          <p className="mt-1 text-xs opacity-70">This determines how many periods occur per year.</p>
        </div>

        <div>
          <label className="block text-sm font-medium">PTO Hours Accrued per Period</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.25"
            value={hoursPerPeriod}
            onChange={(e) => setHoursPerPeriod(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">Example: 4 hours per biweekly pay period.</p>
        </div>

        <div>
          <label className="block text-sm font-medium">Number of Periods to Estimate</label>
          <input
            className="input"
            type="number"
            min={0}
            step="1"
            value={periodCount}
            onChange={(e) => setPeriodCount(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">Tip: For ~6 months biweekly, use 13 periods.</p>
        </div>

        <div>
          <label className="block text-sm font-medium">Hours per Workday</label>
          <input
            className="input"
            type="number"
            min={0.1}
            step="0.5"
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">Used to convert PTO hours into PTO days.</p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="space-y-1">
          <h2 className="text-base font-semibold">Results</h2>
          <p className="text-sm opacity-70">
            This is a simple estimate based on your inputs. Company policies may cap accrual or require waiting periods.
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-lg font-semibold">Total PTO Accrued: {results.totalHours.toFixed(2)} hours</p>
          <p>Equivalent PTO Days: {results.totalDays.toFixed(2)} days</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 pt-2">
          <div className="rounded-md border p-3">
            <p className="text-sm opacity-70">Annualized PTO (based on your frequency)</p>
            <p className="font-semibold">{results.annualHours.toFixed(2)} hours / year</p>
            <p className="text-sm opacity-70">{results.annualDays.toFixed(2)} days / year</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-sm opacity-70">Periods per year</p>
            <p className="font-semibold">{results.ppy} periods</p>
          </div>
        </div>
      </div>
    </div>
  );
}
