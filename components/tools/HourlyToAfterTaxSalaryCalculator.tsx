"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";

type Inputs = {
  hourlyWage: string;     // $
  hoursPerWeek: string;   // hours
  weeksPerYear: string;   // weeks
  taxRate: string;        // %
  deductions: string;     // optional annual deductions
};

type Result = {
  hourlyWage: number;
  hoursPerWeek: number;
  weeksPerYear: number;
  taxRate: number;
  grossAnnual: number;
  estimatedTax: number;
  deductions: number;
  netAnnual: number;
  netMonthly: number;
};

function parseNumber(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

function money(n: number) {
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function HourlyToAfterTaxSalaryCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    hourlyWage: "",
    hoursPerWeek: "40",
    weeksPerYear: "52",
    taxRate: "",
    deductions: "",
  });

  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const hourlyWage = parseNumber(inputs.hourlyWage);
    const hoursPerWeek = parseNumber(inputs.hoursPerWeek);
    const weeksPerYear = parseNumber(inputs.weeksPerYear);
    const taxRate = parseNumber(inputs.taxRate);
    const deductions = inputs.deductions.trim() ? parseNumber(inputs.deductions) : 0;

    if (!Number.isFinite(hourlyWage) || hourlyWage < 0) {
      setError("Hourly wage must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(hoursPerWeek) || hoursPerWeek <= 0) {
      setError("Hours per week must be greater than 0.");
      return;
    }
    if (!Number.isFinite(weeksPerYear) || weeksPerYear <= 0) {
      setError("Weeks per year must be greater than 0.");
      return;
    }
    if (!Number.isFinite(taxRate) || taxRate < 0) {
      setError("Tax rate must be 0 or greater.");
      return;
    }
    if (!Number.isFinite(deductions) || deductions < 0) {
      setError("Deductions must be 0 or greater.");
      return;
    }

    const grossAnnual = hourlyWage * hoursPerWeek * weeksPerYear;
    const estimatedTax = grossAnnual * (taxRate / 100);
    const netAnnual = Math.max(grossAnnual - estimatedTax - deductions, 0);
    const netMonthly = netAnnual / 12;

    setResult({
      hourlyWage,
      hoursPerWeek,
      weeksPerYear,
      taxRate,
      grossAnnual,
      estimatedTax,
      deductions,
      netAnnual,
      netMonthly,
    });
  };

  return (
    <div style={{ border: "1px solid #e1e4e8", borderRadius: 12, padding: 16 }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <label>Hourly wage</label>
            <input
              name="hourlyWage"
              value={inputs.hourlyWage}
              onChange={handleChange}
              placeholder="e.g. 25"
              inputMode="decimal"
            />
          </div>

          <div>
            <label>Hours per week</label>
            <input
              name="hoursPerWeek"
              value={inputs.hoursPerWeek}
              onChange={handleChange}
              placeholder="e.g. 40"
              inputMode="decimal"
            />
          </div>

          <div>
            <label>Weeks per year</label>
            <input
              name="weeksPerYear"
              value={inputs.weeksPerYear}
              onChange={handleChange}
              placeholder="e.g. 52"
              inputMode="decimal"
            />
          </div>

          <div>
            <label>Estimated total tax rate (%)</label>
            <input
              name="taxRate"
              value={inputs.taxRate}
              onChange={handleChange}
              placeholder="e.g. 20"
              inputMode="decimal"
            />
          </div>

          <div>
            <label>Other annual deductions (optional)</label>
            <input
              name="deductions"
              value={inputs.deductions}
              onChange={handleChange}
              placeholder="e.g. 1000"
              inputMode="decimal"
            />
          </div>

          <button type="submit">Calculate</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </form>

      <div style={{ marginTop: 16 }}>
        {!result ? (
          <p>Enter values to estimate after-tax salary from hourly wage.</p>
        ) : (
          <div style={{ display: "grid", gap: 6 }}>
            <div>
              Gross annual pay: <strong>${money(result.grossAnnual)}</strong>
            </div>
            <div>
              Estimated tax: <strong>${money(result.estimatedTax)}</strong>
            </div>
            <div>
              Deductions: <strong>${money(result.deductions)}</strong>
            </div>
            <div>
              After-tax annual pay: <strong>${money(result.netAnnual)}</strong>
            </div>
            <div>
              After-tax monthly pay: <strong>${money(result.netMonthly)}</strong>
            </div>
          </div>
        )}
      </div>

      <p style={{ marginTop: 10, fontSize: 13, color: "#333" }}>
        Note: This is a simplified estimator using a flat tax rate. Real take-home pay can vary due
        to brackets, payroll taxes, and local rules.
      </p>
    </div>
  );
}
