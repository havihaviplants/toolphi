"use client";

import { useMemo, useState } from "react";

function clampNonNegative(n: number) {
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

export default function SalaryOvertimeCalculator() {
  const [annualSalary, setAnnualSalary] = useState<number>(60000);
  const [hoursWorkedPerWeek, setHoursWorkedPerWeek] = useState<number>(50);
  const [overtimeThreshold, setOvertimeThreshold] = useState<number>(40);
  const [overtimeMultiplier, setOvertimeMultiplier] = useState<number>(1.5);
  const [isExempt, setIsExempt] = useState<boolean>(true);

  const results = useMemo(() => {
    const salary = clampNonNegative(annualSalary);
    const hours = clampNonNegative(hoursWorkedPerWeek);
    const threshold = Math.max(0, clampNonNegative(overtimeThreshold));
    const m = Math.max(1, clampNonNegative(overtimeMultiplier));

    const weeklySalary = salary / 52;

    // Common heuristic: treat salary as covering "threshold" hours/week (often 40).
    const hourlyEquivalent =
      threshold > 0 ? weeklySalary / threshold : 0;

    const overtimeHours = Math.max(0, hours - threshold);

    // If exempt: overtime assumed $0 (many salaried-exempt roles)
    const overtimePay = isExempt ? 0 : overtimeHours * hourlyEquivalent * m;

    const totalWeeklyPay = weeklySalary + overtimePay;

    const overtimePremiumOnly = isExempt
      ? 0
      : overtimeHours * hourlyEquivalent * Math.max(0, m - 1);

    const effectiveHourly =
      hours > 0 ? totalWeeklyPay / hours : 0;

    return {
      weeklySalary,
      hourlyEquivalent,
      overtimeHours,
      overtimePay,
      overtimePremiumOnly,
      totalWeeklyPay,
      effectiveHourly,
    };
  }, [
    annualSalary,
    hoursWorkedPerWeek,
    overtimeThreshold,
    overtimeMultiplier,
    isExempt,
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Annual Salary ($/year)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="100"
            value={annualSalary}
            onChange={(e) => setAnnualSalary(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Hours Worked (per week)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.25"
            value={hoursWorkedPerWeek}
            onChange={(e) => setHoursWorkedPerWeek(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Overtime Threshold (hours/week)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.25"
            value={overtimeThreshold}
            onChange={(e) => setOvertimeThreshold(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">Commonly 40 hours/week in many jurisdictions.</p>
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
          <p className="mt-1 text-xs opacity-70">Common: 1.5× (time-and-a-half)</p>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Worker Type</label>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className={`rounded-md border px-3 py-2 text-sm ${
                isExempt ? "font-semibold" : "opacity-70"
              }`}
              onClick={() => setIsExempt(true)}
            >
              Exempt (no overtime assumed)
            </button>
            <button
              type="button"
              className={`rounded-md border px-3 py-2 text-sm ${
                !isExempt ? "font-semibold" : "opacity-70"
              }`}
              onClick={() => setIsExempt(false)}
            >
              Non-Exempt (overtime estimated)
            </button>
          </div>
          <p className="mt-1 text-xs opacity-70">
            This is an estimate. Exempt/non-exempt rules vary by country, state, and job classification.
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          Assumption: salary covers {Math.max(0, overtimeThreshold)} hours/week, converted to an hourly equivalent for overtime estimation.
        </p>

        <p className="font-semibold">Weekly Salary Pay: ${results.weeklySalary.toFixed(2)}</p>
        <p>Hourly Equivalent (salary ÷ {Math.max(0, overtimeThreshold)}h): ${results.hourlyEquivalent.toFixed(2)} / hour</p>

        <p className="pt-2">
          Overtime Hours: <strong>{results.overtimeHours.toFixed(2)}</strong>
        </p>
        <p>Estimated Overtime Pay: ${results.overtimePay.toFixed(2)}</p>
        <p>Overtime Premium (extra above base): ${results.overtimePremiumOnly.toFixed(2)}</p>

        <p className="pt-2">
          Total Weekly Pay (estimate): <strong>${results.totalWeeklyPay.toFixed(2)}</strong>
        </p>
        <p>
          Effective Hourly Rate: <strong>${results.effectiveHourly.toFixed(2)}</strong> / hour
        </p>
      </div>
    </div>
  );
}
