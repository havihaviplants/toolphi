"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function HourlyToSalaryCalculator() {
  const [hourlyWage, setHourlyWage] = useState<number>(25);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(40);
  const [weeksPerYear, setWeeksPerYear] = useState<number>(52);

  const r = useMemo(() => {
    const hourly = Math.max(0, n(hourlyWage));
    const hours = Math.max(0, n(hoursPerWeek));
    const weeks = Math.max(0, n(weeksPerYear));

    const annual = hourly * hours * weeks;
    const monthly = annual / 12;
    const weekly = hourly * hours;
    const daily = hours > 0 ? weekly / 5 : 0;

    return { hourly, hours, weeks, annual, monthly, weekly, daily };
  }, [hourlyWage, hoursPerWeek, weeksPerYear]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Hourly Wage ($/hour)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={hourlyWage}
            onChange={(e) => setHourlyWage(Number(e.target.value))}
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
          This calculator converts an hourly wage into common salary figures.
          Actual pay may vary based on overtime, unpaid leave, or bonuses.
        </p>

        <p className="font-semibold">Annual Salary: ${r.annual.toFixed(2)}</p>
        <p>Monthly Salary: ${r.monthly.toFixed(2)}</p>
        <p>Weekly Pay: ${r.weekly.toFixed(2)}</p>
        <p>Daily Pay (approx.): ${r.daily.toFixed(2)}</p>
      </div>
    </div>
  );
}
