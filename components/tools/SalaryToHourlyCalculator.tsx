"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function SalaryToHourlyCalculator() {
  const [annualSalary, setAnnualSalary] = useState<number>(52000);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(40);
  const [weeksPerYear, setWeeksPerYear] = useState<number>(52);

  const r = useMemo(() => {
    const salary = Math.max(0, n(annualSalary));
    const hours = Math.max(0, n(hoursPerWeek));
    const weeks = Math.max(0, n(weeksPerYear));

    const totalHours = hours * weeks;
    const hourly = totalHours > 0 ? salary / totalHours : 0;

    return { salary, hours, weeks, totalHours, hourly };
  }, [annualSalary, hoursPerWeek, weeksPerYear]);

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
          <label className="block text-sm font-medium">Hours per Week</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.1"
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Weeks per Year</label>
          <input
            className="input"
            type="number"
            min={0}
            step="1"
            value={weeksPerYear}
            onChange={(e) => setWeeksPerYear(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          This calculator converts an annual salary into an equivalent hourly wage.
          Overtime, unpaid leave, and bonuses are not included.
        </p>

        <p className="font-semibold">Estimated Hourly Wage: ${r.hourly.toFixed(2)} / hour</p>
        <p className="text-sm opacity-80">
          ${r.salary.toFixed(0)} ÷ ({r.hours.toFixed(1)} × {r.weeks.toFixed(0)}) = ${r.hourly.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
