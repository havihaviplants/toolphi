"use client";

import { useMemo, useState } from "react";

function clampNonNegative(n: number) {
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function clampPercent01(n: number) {
  const x = Number.isFinite(n) ? n : 0;
  return Math.min(1, Math.max(0, x));
}

export default function ContractorHourlyRateCalculator() {
  const [targetTakeHome, setTargetTakeHome] = useState<number>(80000);
  const [billableHoursPerWeek, setBillableHoursPerWeek] = useState<number>(25);
  const [weeksPerYear, setWeeksPerYear] = useState<number>(48);
  const [annualExpenses, setAnnualExpenses] = useState<number>(10000);
  const [taxRate, setTaxRate] = useState<number>(0.25);

  const results = useMemo(() => {
    const takeHome = clampNonNegative(targetTakeHome);
    const hoursPerWeek = clampNonNegative(billableHoursPerWeek);
    const weeks = clampNonNegative(weeksPerYear);
    const expenses = clampNonNegative(annualExpenses);
    const t = clampPercent01(taxRate);

    const billableHoursPerYear = hoursPerWeek * weeks;

    // Revenue needed before tax to achieve take-home after tax:
    // takeHome = (revenue - expenses) * (1 - taxRate)
    // => revenue = expenses + takeHome / (1 - taxRate)
    const revenueNeeded =
      t >= 1 ? Infinity : expenses + (1 - t > 0 ? takeHome / (1 - t) : Infinity);

    const hourlyRate =
      billableHoursPerYear > 0 ? revenueNeeded / billableHoursPerYear : Infinity;

    const preTaxProfit = revenueNeeded - expenses;
    const estimatedTax = preTaxProfit * t;

    return {
      billableHoursPerYear,
      revenueNeeded,
      hourlyRate,
      preTaxProfit,
      estimatedTax,
      effectiveTakeHome: preTaxProfit - estimatedTax,
    };
  }, [targetTakeHome, billableHoursPerWeek, weeksPerYear, annualExpenses, taxRate]);

  const safeMoney = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : "—");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-base font-semibold">Inputs</h2>
        <p className="text-sm opacity-70">
          This estimates a suggested contractor hourly rate from your take-home goal, expenses, billable hours, and an estimated tax rate.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Target Annual Take-Home ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="100"
            value={targetTakeHome}
            onChange={(e) => setTargetTakeHome(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">Your after-tax income goal.</p>
        </div>

        <div>
          <label className="block text-sm font-medium">Annual Business Expenses ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="100"
            value={annualExpenses}
            onChange={(e) => setAnnualExpenses(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">Software, equipment, insurance, etc.</p>
        </div>

        <div>
          <label className="block text-sm font-medium">Billable Hours per Week</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.25"
            value={billableHoursPerWeek}
            onChange={(e) => setBillableHoursPerWeek(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">Only hours you can invoice (not admin time).</p>
        </div>

        <div>
          <label className="block text-sm font-medium">Weeks per Year (billable)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="1"
            value={weeksPerYear}
            onChange={(e) => setWeeksPerYear(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">Example: 48 weeks (4 weeks off).</p>
        </div>

        <div>
          <label className="block text-sm font-medium">Estimated Tax Rate</label>
          <input
            className="input"
            type="number"
            min={0}
            max={1}
            step="0.01"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">Use a decimal (0.25 = 25%).</p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="space-y-1">
          <h2 className="text-base font-semibold">Results</h2>
          <p className="text-sm opacity-70">
            This is a simplified estimate. Real taxes and deductions vary. Use it as a starting point for pricing.
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-lg font-semibold">
            Suggested Hourly Rate: ${safeMoney(results.hourlyRate)}
            {Number.isFinite(results.hourlyRate) ? " / hour" : ""}
          </p>
          <p>Billable Hours per Year: {safeMoney(results.billableHoursPerYear)}</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 pt-2">
          <div className="rounded-md border p-3">
            <p className="text-sm opacity-70">Revenue needed</p>
            <p className="font-semibold">${safeMoney(results.revenueNeeded)}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-sm opacity-70">Estimated tax (on profit)</p>
            <p className="font-semibold">${safeMoney(results.estimatedTax)}</p>
          </div>
        </div>

        <div className="rounded-md border p-3">
          <p className="text-sm opacity-70">Estimated take-home (after tax)</p>
          <p className="font-semibold">${safeMoney(results.effectiveTakeHome)}</p>
        </div>
      </div>
    </div>
  );
}
