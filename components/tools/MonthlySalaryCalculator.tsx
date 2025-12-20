"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function MonthlySalaryCalculator() {
  const [annualSalary, setAnnualSalary] = useState<number>(60000);
  const [annualBonus, setAnnualBonus] = useState<number>(0);

  // Keep assumptions explicit and stable
  const [weeksPerYear, setWeeksPerYear] = useState<number>(52);

  const r = useMemo(() => {
    const salary = Math.max(0, n(annualSalary));
    const bonus = Math.max(0, n(annualBonus));
    const weeks = Math.max(1, n(weeksPerYear));

    const totalAnnual = salary + bonus;

    const monthly = totalAnnual / 12;
    const weekly = totalAnnual / weeks;
    const daily = weekly / 5; // simple approximation

    return { salary, bonus, totalAnnual, weeks, monthly, weekly, daily };
  }, [annualSalary, annualBonus, weeksPerYear]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Annual Salary ($/year)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="1"
            value={annualSalary}
            onChange={(e) => setAnnualSalary(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Annual Bonus ($/year) (optional)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="1"
            value={annualBonus}
            onChange={(e) => setAnnualBonus(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Weeks per Year</label>
          <input
            className="input"
            type="number"
            min={1}
            step="1"
            value={weeksPerYear}
            onChange={(e) => setWeeksPerYear(Number(e.target.value))}
          />
          <p className="text-xs opacity-70 mt-1">Default is 52 weeks. Adjust if you use a different convention.</p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          This converts annual compensation into monthly, weekly, and daily estimates.
          Daily pay is a simple approximation based on 5 workdays per week.
        </p>

        <p className="font-semibold">Total Annual Compensation: ${r.totalAnnual.toFixed(0)}</p>
        <p>Monthly: ${r.monthly.toFixed(2)}</p>
        <p>Weekly: ${r.weekly.toFixed(2)}</p>
        <p>Daily (approx.): ${r.daily.toFixed(2)}</p>

        <p className="text-sm opacity-80 pt-2">
          Monthly = (Salary + Bonus) / 12 = (${r.salary.toFixed(0)} + ${r.bonus.toFixed(0)}) / 12
        </p>
      </div>
    </div>
  );
}
